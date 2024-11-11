/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
    readonly QUICKBOOKS_CLIENT_ID: string;
    readonly QUICKBOOKS_CLIENT_SECRET: string;
    readonly QUICKBOOKS_REDIRECT_URI: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }