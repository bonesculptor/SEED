import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'crypto';

interface DIDDocument {
  '@context': string[];
  id: string;
  controller: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
  }[];
  authentication: string[];
  assertionMethod: string[];
  created: string;
  updated: string;
}

class DIDService {
  private generateDID(method: string, identifier: string): string {
    return `did:${method}:${identifier}`;
  }

  private generateUUID(): string {
    const crypto = window.crypto || (window as any).msCrypto;
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);

    array[6] = (array[6] & 0x0f) | 0x40;
    array[8] = (array[8] & 0x3f) | 0x80;

    const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  private async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true,
      ['sign', 'verify']
    );

    const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    const publicKey = this.arrayBufferToBase64(publicKeyBuffer);
    const privateKey = this.arrayBufferToBase64(privateKeyBuffer);

    return { publicKey, privateKey };
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async encryptPrivateKey(privateKey: string, password?: string): Promise<string> {
    const defaultPassword = password || 'default-encryption-key-change-in-production';
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(defaultPassword),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('persona-blockchain-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      enc.encode(privateKey)
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  async createPatientDID(patientData: {
    name: string;
    nhsNumber?: string;
    birthDate: string;
    hospitalNumber?: string;
    patientId?: string;
  }): Promise<{ did: string; didDocument: DIDDocument; publicKey: string }> {
    const uniqueId = patientData.patientId || this.generateUUID();
    const did = this.generateDID('web', uniqueId);

    const { publicKey, privateKey } = await this.generateKeyPair();
    const encryptedPrivateKey = await this.encryptPrivateKey(privateKey);

    const now = new Date().toISOString();

    const didDocument: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ],
      id: did,
      controller: did,
      verificationMethod: [{
        id: `${did}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: publicKey
      }],
      authentication: [`${did}#key-1`],
      assertionMethod: [`${did}#key-1`],
      created: now,
      updated: now
    };

    const { data, error } = await supabase.from('patient_identifiers').insert({
      patient_id: patientData.patientId || null,
      did: did,
      did_document: didDocument,
      public_key: publicKey,
      private_key_encrypted: encryptedPrivateKey,
      key_algorithm: 'ECDSA-P256',
      patient_name: patientData.name,
      nhs_number: patientData.nhsNumber,
      blockchain_status: 'ready_for_anchor',
      created_at: now
    }).select().maybeSingle();

    if (error) {
      console.error('Error creating DID:', error);
      throw error;
    }

    return { did, didDocument, publicKey };
  }

  async getPatientDID(nhsNumber: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('patient_identifiers')
      .select('did')
      .eq('nhs_number', nhsNumber)
      .maybeSingle();

    if (error || !data) return null;
    return data.did;
  }

  async getDIDDocument(did: string): Promise<DIDDocument | null> {
    const { data, error } = await supabase
      .from('patient_identifiers')
      .select('did_document')
      .eq('did', did)
      .maybeSingle();

    if (error || !data) return null;
    return data.did_document as DIDDocument;
  }

  async markAsBlockchainAnchored(did: string, parachainId: string, blockHash: string): Promise<boolean> {
    const { error } = await supabase
      .from('patient_identifiers')
      .update({
        blockchain_status: 'anchored',
        parachain_id: parachainId,
        blockchain_hash: blockHash,
        anchored_at: new Date().toISOString()
      })
      .eq('did', did);

    return !error;
  }

  generateBlockchainRecord(did: string, didDocument: DIDDocument) {
    return {
      version: '1.0',
      standard: 'W3C-DID',
      identifier: did,
      document: didDocument,
      immutable: true,
      timestamp: new Date().toISOString(),
      hash: this.hashDocument(didDocument)
    };
  }

  private hashDocument(doc: any): string {
    const str = JSON.stringify(doc);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

export const didService = new DIDService();
