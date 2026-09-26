# Supabase adapters

Supabase is not initialized in the content-only MVP. When adding it, create separate server and browser client factories using `@supabase/ssr`; never import a service role key from a client component. Keep feature queries inside their owning module.
