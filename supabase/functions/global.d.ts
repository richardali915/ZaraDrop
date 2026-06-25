// Minimal Deno/Supabase function declarations for editor
declare const Deno: any;

declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(handler: (req: any) => Promise<any> | any): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export function createClient(...args: any[]): any;
  export const SupabaseClient: any;
  export type User = any;
}
