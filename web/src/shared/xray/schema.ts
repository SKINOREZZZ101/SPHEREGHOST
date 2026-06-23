// Curated JSON Schema (draft-07 subset) for Xray-core configurations.
// Powers Monaco autocomplete + inline diagnostics. Not exhaustive, but
// covers the structures Ghost Sphere operators touch most often.
export const XRAY_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'Xray Configuration',
  properties: {
    log: {
      type: 'object',
      properties: {
        loglevel: { enum: ['debug', 'info', 'warning', 'error', 'none'] },
        access: { type: 'string' },
        error: { type: 'string' },
        dnsLog: { type: 'boolean' },
      },
    },
    api: {
      type: 'object',
      properties: {
        tag: { type: 'string' },
        services: { type: 'array', items: { type: 'string' } },
      },
    },
    dns: { type: 'object' },
    policy: { type: 'object' },
    routing: {
      type: 'object',
      properties: {
        domainStrategy: { enum: ['AsIs', 'IPIfNonMatch', 'IPOnDemand'] },
        rules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { const: 'field' },
              inboundTag: { type: 'array', items: { type: 'string' } },
              outboundTag: { type: 'string' },
              domain: { type: 'array', items: { type: 'string' } },
              ip: { type: 'array', items: { type: 'string' } },
              port: { type: ['string', 'number'] },
              protocol: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        balancers: { type: 'array' },
      },
    },
    inbounds: {
      type: 'array',
      items: {
        type: 'object',
        required: ['protocol'],
        properties: {
          tag: { type: 'string' },
          listen: { type: 'string' },
          port: { type: ['number', 'string'] },
          protocol: {
            enum: ['vless', 'vmess', 'trojan', 'shadowsocks', 'socks', 'http', 'dokodemo-door', 'wireguard'],
          },
          settings: { type: 'object' },
          streamSettings: {
            type: 'object',
            properties: {
              network: { enum: ['tcp', 'raw', 'ws', 'grpc', 'http', 'httpupgrade', 'xhttp', 'kcp', 'quic'] },
              security: { enum: ['none', 'tls', 'reality'] },
              realitySettings: { type: 'object' },
              tlsSettings: { type: 'object' },
              wsSettings: { type: 'object' },
              grpcSettings: { type: 'object' },
            },
          },
          sniffing: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              destOverride: { type: 'array', items: { enum: ['http', 'tls', 'quic', 'fakedns'] } },
            },
          },
        },
      },
    },
    outbounds: {
      type: 'array',
      items: {
        type: 'object',
        required: ['protocol'],
        properties: {
          tag: { type: 'string' },
          protocol: {
            enum: ['freedom', 'blackhole', 'vless', 'vmess', 'trojan', 'shadowsocks', 'socks', 'http', 'wireguard', 'dns', 'loopback'],
          },
          settings: { type: 'object' },
          streamSettings: { type: 'object' },
          proxySettings: { type: 'object' },
          mux: { type: 'object' },
        },
      },
    },
    stats: { type: 'object' },
    transport: { type: 'object' },
    reverse: { type: 'object' },
    observatory: { type: 'object' },
    burstObservatory: { type: 'object' },
    fakedns: { type: 'array' },
    metrics: { type: 'object' },
  },
};

export interface ValidationIssue {
  level: 'error' | 'warning';
  message: string;
}

/** Lightweight semantic validation beyond JSON syntax / schema. */
export function validateXray(text: string): { ok: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { ok: false, issues: [{ level: 'error', message: `JSON: ${(e as Error).message}` }] };
  }

  const cfg = parsed as Record<string, unknown>;
  const inbounds = cfg.inbounds as Array<Record<string, unknown>> | undefined;
  const outbounds = cfg.outbounds as Array<Record<string, unknown>> | undefined;

  if (!Array.isArray(inbounds) || inbounds.length === 0) {
    issues.push({ level: 'error', message: 'inbounds: at least one inbound is required' });
  }
  if (!Array.isArray(outbounds) || outbounds.length === 0) {
    issues.push({ level: 'warning', message: 'outbounds: usually at least one outbound (freedom) is expected' });
  }

  const tags = new Set<string>();
  inbounds?.forEach((ib, i) => {
    const tag = ib.tag as string | undefined;
    if (!ib.protocol) issues.push({ level: 'error', message: `inbounds[${i}]: missing protocol` });
    if (tag) {
      if (tags.has(tag)) issues.push({ level: 'error', message: `inbounds[${i}]: duplicate tag "${tag}"` });
      tags.add(tag);
    } else {
      issues.push({ level: 'warning', message: `inbounds[${i}]: missing tag` });
    }
    const ss = ib.streamSettings as Record<string, unknown> | undefined;
    if (ss?.security === 'reality' && !ss.realitySettings) {
      issues.push({ level: 'error', message: `inbounds[${i}]: reality security requires realitySettings` });
    }
  });

  outbounds?.forEach((ob, i) => {
    if (!ob.protocol) issues.push({ level: 'error', message: `outbounds[${i}]: missing protocol` });
  });

  return { ok: issues.every((x) => x.level !== 'error'), issues };
}
