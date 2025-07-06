# Supabase Integration Documentation for FileInsight Frontend

## Supabase Project
- URL: https://sirvwsslwxxxuysywyan.supabase.co
- Project Name: project_2025_07_03

## Supabase Features Used
- Auth (email & Google)
- Storage (bucket: `books`)
    - File uploads: Each user uploads files to the `books` storage bucket
    - Upload destination: `${user.id}/${timestamp}_${file.name}` (user-private prefix)

## Environment Variables Required
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

## Problem: Upload "row-level security" (RLS) Policy Error
- During frontend uploads to Supabase Storage, the error occurs:  
  `new row violates row-level security policy`
- Usually, this is due to:
    - Missing or overly restrictive RLS policy on the `storage.objects` table in Supabase.
    - Authenticated users do not have insert permission in the `books` bucket.
    - No storage object policies for insert/create for the authenticated user.

## REQUIRED SUPABASE POLICIES for Correct Operation

### Tables Involved
- `storage.objects` — all objects uploaded to any storage bucket, including `books`
- Buckets: `books` (must exist, should not be public)

### Minimum Policy for Authenticated Upload/Download

#### 👇 **Important: Apply via Supabase Dashboard**
Due to project constraints, RLS policies must be set up using the Supabase **Table Editor** UI in the dashboard — *not via code or API*.

#### Required Policies (copy/paste in dashboard as needed):

1. **Authenticated users can insert (upload) to `books` bucket where prefix starts with their user ID:**
```sql
-- Policy name: "Authenticated users can upload to their own prefix"
CREATE POLICY "Authenticated users can upload to their own prefix"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'books'
  AND (auth.role() = 'authenticated')
  AND (storage.foldername(name) = auth.uid() OR left(name, length(auth.uid()) + 1) = auth.uid() || '/')
);
```
- `storage.foldername(name)` gets the prefix of the path, e.g., for `f1e2d3/123_filename.pdf`, user id is `f1e2d3`.
- Alternatively, match with `left(name, ...)` for more robust user-id isolation.

2. **Authenticated users can list/download their own objects:**
```sql
-- Policy name: "Authenticated users can select their own files"
CREATE POLICY "Authenticated users can select their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'books'
  AND (auth.role() = 'authenticated')
  AND (storage.foldername(name) = auth.uid() OR left(name, length(auth.uid()) + 1) = auth.uid() || '/')
);
```

3. **Optionally, allow only the uploader/owner read/write on their files.**

#### How to Fix / Apply Policies

- **Dashboard Location:**  
  Go to: Supabase Project > Table editor > `storage.objects` > "RLS" tab.
- **Enable RLS:**  
  Make sure "Row Level Security" is **enabled** (switch ON).
- **Add INSERT policy** for the `books` bucket with the SQL above:
    - Click "New Policy" > "Insert" and paste the SQL check.
- **Add SELECT policy** for the `books` bucket with the SQL above:
    - Click "New Policy" > "Select" and paste the SQL check.
- **Save and deploy policies** using the dashboard controls.

---

**Note:**  
If these changes are not made, uploads will fail with "row-level security policy" errors. This is a Supabase-side config that cannot be updated from the project codebase or API. Only a project admin (in the dashboard) can make these changes.

---

## Notes

- If your files are uploaded with `{user.id}/` prefix but the policy expects a different structure, update accordingly.
- Make sure `auth.uid()` is available (user is logged in; anonymous uploads will not work).
- If you want to allow public files, you may opt-in for public read/list but **not upload**!
- If `storage.foldername(name)` fails, use a custom SQL expression `left(name, ...)` as above for prefix checking.

---

## Reference
- [Supabase Storage RLS Guide](https://supabase.com/docs/guides/storage/auth)
- [Supabase Storage Upload Permissions](https://supabase.com/docs/guides/storage#authorization)
