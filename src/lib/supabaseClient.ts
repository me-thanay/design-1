import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// If env vars are missing/invalid, export a silent no-op client so the app
// can run without Supabase (useful during local UI work).
const hasValidConfig =
  !!supabaseUrl && !!supabaseAnonKey && isValidHttpUrl(supabaseUrl);

function createNoopQueryBuilder() {
  const state: { data: any; error: any } = { data: [], error: null };

  const builder: any = {
    // Make the builder awaitable: `await supabase.from(...).select(...).order(...)`
    then: (resolve: any, _reject: any) => Promise.resolve(state).then(resolve),
    catch: (_reject: any) => Promise.resolve(state),
    finally: (onFinally: any) => Promise.resolve(state).finally(onFinally),

    // Query methods (chainable)
    select: (_cols?: any) => {
      state.data = [];
      state.error = null;
      return builder;
    },
    insert: (_payload?: any) => {
      state.data = null;
      state.error = null;
      return builder;
    },
    update: (_payload?: any) => {
      state.data = null;
      state.error = null;
      return builder;
    },
    delete: () => {
      state.data = null;
      state.error = null;
      return builder;
    },
    upsert: (_payload?: any) => {
      state.data = null;
      state.error = null;
      return builder;
    },
    single: () => {
      state.data = null;
      state.error = null;
      return builder;
    },

    // Filters / modifiers (chainable)
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
  };

  return builder;
}

function createNoopSupabase() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
    },
    from: () => createNoopQueryBuilder(),
  } as any;
}

export const supabase = hasValidConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createNoopSupabase();

export const supabaseEnabled = hasValidConfig;

