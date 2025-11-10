import { Writer, DataFactory } from 'n3';
const { namedNode, literal, quad } = DataFactory;

interface Protocol {
  id: number;
  protocol_type: string;
  version: string;
  status: string;
  validation_status: string;
  metadata: any;
  content: any;
  created_at: string;
  updated_at: string;
}

const NAMESPACES = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  dc: 'http://purl.org/dc/elements/1.1/',
  dcterms: 'http://purl.org/dc/terms/',
  foaf: 'http://xmlns.com/foaf/0.1/',
  schema: 'http://schema.org/',
  ap: 'http://agentprotocols.org/ontology#',
  hcp: 'http://agentprotocols.org/hcp#',
  bcp: 'http://agentprotocols.org/bcp#',
  mcp: 'http://agentprotocols.org/mcp#',
  dcp: 'http://agentprotocols.org/dcp#',
  tcp: 'http://agentprotocols.org/tcp#',
  geo: 'http://www.opengis.net/ont/geosparql#',
  sf: 'http://www.opengis.net/ont/sf#'
};

export class RDFExporter {
  private writer: Writer;

  constructor() {
    this.writer = new Writer({
      prefixes: NAMESPACES
    });
  }

  exportProtocol(protocol: Protocol): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const writer = new Writer({ prefixes: NAMESPACES });
        const baseUri = `${NAMESPACES.ap}protocol/${protocol.protocol_type}/${protocol.id}`;
        const subject = namedNode(baseUri);

        writer.addQuad(
          subject,
          namedNode(`${NAMESPACES.rdf}type`),
          namedNode(`${NAMESPACES.ap}Protocol`)
        );

        writer.addQuad(
          subject,
          namedNode(`${NAMESPACES.rdf}type`),
          namedNode(this.getProtocolTypeUri(protocol.protocol_type))
        );

        writer.addQuad(
          subject,
          namedNode(`${NAMESPACES.ap}protocolType`),
          literal(protocol.protocol_type)
        );

        writer.addQuad(
          subject,
          namedNode(`${NAMESPACES.ap}version`),
          literal(protocol.version, namedNode(`${NAMESPACES.xsd}string`))
        );

        writer.addQuad(
          subject,
          namedNode(`${NAMESPACES.ap}status`),
          literal(protocol.status)
        );

        writer.addQuad(
          subject,
          namedNode(`${NAMESPACES.ap}validationStatus`),
          literal(protocol.validation_status)
        );

        writer.addQuad(
          subject,
          namedNode(`${NAMESPACES.dcterms}created`),
          literal(protocol.created_at, namedNode(`${NAMESPACES.xsd}dateTime`))
        );

        writer.addQuad(
          subject,
          namedNode(`${NAMESPACES.dcterms}modified`),
          literal(protocol.updated_at, namedNode(`${NAMESPACES.xsd}dateTime`))
        );

        if (protocol.metadata?.name) {
          writer.addQuad(
            subject,
            namedNode(`${NAMESPACES.rdfs}label`),
            literal(protocol.metadata.name)
          );
        }

        if (protocol.metadata?.description) {
          writer.addQuad(
            subject,
            namedNode(`${NAMESPACES.dc}description`),
            literal(protocol.metadata.description)
          );
        }

        this.addProtocolSpecificTriples(writer, subject, protocol);

        writer.end((error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  exportMultipleProtocols(protocols: Protocol[]): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const writer = new Writer({ prefixes: NAMESPACES });

        protocols.forEach(protocol => {
          const baseUri = `${NAMESPACES.ap}protocol/${protocol.protocol_type}/${protocol.id}`;
          const subject = namedNode(baseUri);

          writer.addQuad(
            subject,
            namedNode(`${NAMESPACES.rdf}type`),
            namedNode(`${NAMESPACES.ap}Protocol`)
          );

          writer.addQuad(
            subject,
            namedNode(`${NAMESPACES.rdf}type`),
            namedNode(this.getProtocolTypeUri(protocol.protocol_type))
          );

          writer.addQuad(
            subject,
            namedNode(`${NAMESPACES.ap}protocolType`),
            literal(protocol.protocol_type)
          );

          writer.addQuad(
            subject,
            namedNode(`${NAMESPACES.ap}version`),
            literal(protocol.version)
          );

          writer.addQuad(
            subject,
            namedNode(`${NAMESPACES.ap}status`),
            literal(protocol.status)
          );

          if (protocol.metadata?.name) {
            writer.addQuad(
              subject,
              namedNode(`${NAMESPACES.rdfs}label`),
              literal(protocol.metadata.name)
            );
          }

          this.addProtocolSpecificTriples(writer, subject, protocol);
        });

        writer.end((error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private getProtocolTypeUri(type: string): string {
    const typeMap: Record<string, string> = {
      'hcp': `${NAMESPACES.hcp}HumanContextProtocol`,
      'bcp': `${NAMESPACES.bcp}BusinessContextProtocol`,
      'mcp': `${NAMESPACES.mcp}MachineContextProtocol`,
      'dcp': `${NAMESPACES.dcp}DataContextProtocol`,
      'tcp': `${NAMESPACES.tcp}TestContextProtocol`
    };
    return typeMap[type] || `${NAMESPACES.ap}${type.toUpperCase()}`;
  }

  private addProtocolSpecificTriples(writer: Writer, subject: any, protocol: Protocol) {
    const namespace = this.getProtocolNamespace(protocol.protocol_type);

    switch (protocol.protocol_type) {
      case 'hcp':
        this.addHCPTriples(writer, subject, protocol, namespace);
        break;
      case 'bcp':
        this.addBCPTriples(writer, subject, protocol, namespace);
        break;
      case 'mcp':
        this.addMCPTriples(writer, subject, protocol, namespace);
        break;
      case 'dcp':
        this.addDCPTriples(writer, subject, protocol, namespace);
        break;
      case 'tcp':
        this.addTCPTriples(writer, subject, protocol, namespace);
        break;
    }
  }

  private getProtocolNamespace(type: string): string {
    return NAMESPACES[type as keyof typeof NAMESPACES] || NAMESPACES.ap;
  }

  private addHCPTriples(writer: Writer, subject: any, protocol: Protocol, ns: string) {
    if (protocol.content?.identity?.name) {
      writer.addQuad(
        subject,
        namedNode(`${ns}hasIdentity`),
        literal(protocol.content.identity.name)
      );
    }

    if (protocol.content?.identity?.role) {
      writer.addQuad(
        subject,
        namedNode(`${ns}hasRole`),
        literal(protocol.content.identity.role)
      );
    }

    if (protocol.content?.location?.coordinates) {
      const coordsNode = namedNode(`${subject.value}/location`);
      writer.addQuad(
        subject,
        namedNode(`${ns}hasLocation`),
        coordsNode
      );

      writer.addQuad(
        coordsNode,
        namedNode(`${NAMESPACES.rdf}type`),
        namedNode(`${NAMESPACES.geo}Point`)
      );

      const wkt = `POINT(${protocol.content.location.coordinates.longitude} ${protocol.content.location.coordinates.latitude})`;
      writer.addQuad(
        coordsNode,
        namedNode(`${NAMESPACES.geo}asWKT`),
        literal(wkt, namedNode(`${NAMESPACES.geo}wktLiteral`))
      );
    }

    if (protocol.content?.preferences) {
      Object.entries(protocol.content.preferences).forEach(([key, value]) => {
        writer.addQuad(
          subject,
          namedNode(`${ns}preference/${key}`),
          literal(String(value))
        );
      });
    }
  }

  private addBCPTriples(writer: Writer, subject: any, protocol: Protocol, ns: string) {
    if (protocol.content?.business_model?.name) {
      writer.addQuad(
        subject,
        namedNode(`${ns}hasBusinessModel`),
        literal(protocol.content.business_model.name)
      );
    }

    if (protocol.content?.value_proposition) {
      writer.addQuad(
        subject,
        namedNode(`${ns}valueProposition`),
        literal(protocol.content.value_proposition)
      );
    }

    if (protocol.content?.customer_segments) {
      protocol.content.customer_segments.forEach((segment: string) => {
        writer.addQuad(
          subject,
          namedNode(`${ns}hasCustomerSegment`),
          literal(segment)
        );
      });
    }

    if (protocol.content?.revenue_streams) {
      protocol.content.revenue_streams.forEach((stream: any) => {
        const streamNode = namedNode(`${subject.value}/revenue/${stream.type}`);
        writer.addQuad(
          subject,
          namedNode(`${ns}hasRevenueStream`),
          streamNode
        );
        writer.addQuad(
          streamNode,
          namedNode(`${NAMESPACES.schema}name`),
          literal(stream.type)
        );
      });
    }
  }

  private addMCPTriples(writer: Writer, subject: any, protocol: Protocol, ns: string) {
    if (protocol.content?.agent_id) {
      writer.addQuad(
        subject,
        namedNode(`${ns}agentIdentifier`),
        literal(protocol.content.agent_id)
      );
    }

    if (protocol.content?.capabilities) {
      protocol.content.capabilities.forEach((capability: string) => {
        writer.addQuad(
          subject,
          namedNode(`${ns}hasCapability`),
          literal(capability)
        );
      });
    }

    if (protocol.content?.model_config?.model_type) {
      writer.addQuad(
        subject,
        namedNode(`${ns}modelType`),
        literal(protocol.content.model_config.model_type)
      );
    }

    if (protocol.content?.model_config?.parameters) {
      Object.entries(protocol.content.model_config.parameters).forEach(([key, value]) => {
        writer.addQuad(
          subject,
          namedNode(`${ns}parameter/${key}`),
          literal(String(value))
        );
      });
    }
  }

  private addDCPTriples(writer: Writer, subject: any, protocol: Protocol, ns: string) {
    if (protocol.content?.data_sources) {
      protocol.content.data_sources.forEach((source: any) => {
        const sourceNode = namedNode(`${subject.value}/datasource/${source.id}`);
        writer.addQuad(
          subject,
          namedNode(`${ns}hasDataSource`),
          sourceNode
        );
        writer.addQuad(
          sourceNode,
          namedNode(`${NAMESPACES.dc}type`),
          literal(source.type)
        );
        if (source.location) {
          writer.addQuad(
            sourceNode,
            namedNode(`${NAMESPACES.schema}url`),
            literal(source.location)
          );
        }
      });
    }

    if (protocol.content?.schema) {
      Object.entries(protocol.content.schema).forEach(([field, type]) => {
        writer.addQuad(
          subject,
          namedNode(`${ns}schemaField/${field}`),
          literal(String(type))
        );
      });
    }

    if (protocol.content?.quality_metrics) {
      Object.entries(protocol.content.quality_metrics).forEach(([metric, value]) => {
        writer.addQuad(
          subject,
          namedNode(`${ns}qualityMetric/${metric}`),
          literal(String(value))
        );
      });
    }
  }

  private addTCPTriples(writer: Writer, subject: any, protocol: Protocol, ns: string) {
    if (protocol.content?.test_suite) {
      writer.addQuad(
        subject,
        namedNode(`${ns}testSuite`),
        literal(protocol.content.test_suite)
      );
    }

    if (protocol.content?.test_cases) {
      protocol.content.test_cases.forEach((testCase: any, index: number) => {
        const testNode = namedNode(`${subject.value}/test/${index}`);
        writer.addQuad(
          subject,
          namedNode(`${ns}hasTestCase`),
          testNode
        );
        writer.addQuad(
          testNode,
          namedNode(`${NAMESPACES.dc}title`),
          literal(testCase.name)
        );
        writer.addQuad(
          testNode,
          namedNode(`${ns}testStatus`),
          literal(testCase.status || 'pending')
        );
      });
    }

    if (protocol.content?.coverage) {
      Object.entries(protocol.content.coverage).forEach(([key, value]) => {
        writer.addQuad(
          subject,
          namedNode(`${ns}coverage/${key}`),
          literal(String(value))
        );
      });
    }
  }

  async exportToFile(protocol: Protocol, filename?: string): Promise<void> {
    const turtle = await this.exportProtocol(protocol);
    const blob = new Blob([turtle], { type: 'text/turtle' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${protocol.protocol_type}-${protocol.id}.ttl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async exportMultipleToFile(protocols: Protocol[], filename?: string): Promise<void> {
    const turtle = await this.exportMultipleProtocols(protocols);
    const blob = new Blob([turtle], { type: 'text/turtle' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `protocols-export-${Date.now()}.ttl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const rdfExporter = new RDFExporter();
