/**
 * Turso/libSQL database adapter.
 * Implements the Database interface so it's a drop-in replacement for pureSqlite.
 */
import { createClient, type Client } from "@libsql/client";

export interface Database {
  exec(sql: string): Promise<void>;
  get(sql: string, params?: any[]): Promise<any>;
  all(sql: string, params?: any[]): Promise<any[]>;
  run(sql: string, params?: any[]): Promise<{ lastID?: any; changes?: number }>;
}

export class TursoDatabase implements Database {
  private client: Client;

  constructor(url: string, authToken: string) {
    this.client = createClient({ url, authToken });
  }

  async exec(sql: string): Promise<void> {
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (statements.length === 1) {
      await this.client.execute({ sql: statements[0] });
    } else {
      const ops = statements.map((s) => ({ sql: s, args: [] as any[] }));
      await this.client.batch(ops, "deferred");
    }
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const result = await this.client.execute({ sql, args: params });
    return result.rows[0] || null;
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    const result = await this.client.execute({ sql, args: params });
    return result.rows;
  }

  async run(
    sql: string,
    params: any[] = []
  ): Promise<{ lastID?: any; changes?: number }> {
    const result = await this.client.execute({ sql, args: params });
    const lastRowid = (result as any).lastRowid ?? null;
    return {
      lastID: lastRowid,
      changes: result.rowsAffected,
    };
  }

  /** Close the database connection */
  async close(): Promise<void> {
    this.client.close();
  }
}

export function openTursoDatabase(
  url: string,
  authToken: string
): Promise<Database> {
  return Promise.resolve(new TursoDatabase(url, authToken));
}
