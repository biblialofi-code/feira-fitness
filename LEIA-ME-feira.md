# Score de Conversão — Fitness Brasil Expo 2026 (setup)

Reaproveita o MESMO Supabase e a MESMA Vercel do diagnóstico.
Só precisa criar 2 tabelas novas e subir os arquivos.

## 1. Criar as tabelas (Supabase → SQL Editor → cole e Run)

```sql
-- scores anônimos (para o ranking ao vivo)
create table if not exists scores_feira (
  id bigint generated always as identity primary key,
  criado_em timestamptz default now(),
  score int,
  gargalo text
);
alter table scores_feira enable row level security;
create policy "insert scores" on scores_feira for insert to anon, authenticated with check (true);
create policy "read scores"   on scores_feira for select to anon, authenticated using (true);

-- leads com dados pessoais (só entram com consentimento no app)
create table if not exists leads_feira (
  id bigint generated always as identity primary key,
  criado_em timestamptz default now(),
  score int, gargalo text,
  nome text, funcao text, academia text,
  unidades text, alunos text, inativos text,
  telefone text, email text
);
alter table leads_feira enable row level security;
create policy "insert leads" on leads_feira for insert to anon, authenticated with check (true);
```

## 2. Variáveis na Vercel
Já tem SUPABASE_URL, SUPABASE_SERVICE_KEY e ANTHROPIC_API_KEY do outro projeto.
Se for um projeto Vercel NOVO, adicione as três de novo (mesmos valores).

## 3. Subir arquivos (GitHub)
- index.html (na raiz)
- api/score.js, api/chat.js (dentro da pasta api)
- package.json

Redeploy e pronto. O QR aponta pra esse link.

## 4. Testar
Abra, responda as 6 perguntas, veja o score e o gargalo, preencha o cadastro,
marque o consentimento. Depois no Supabase:
- scores_feira: deve ter a linha do score
- leads_feira: deve ter o cadastro completo

O ranking (posição X de Y) só aparece depois de 20 academias avaliadas —
antes disso mostra "uma das N já avaliadas". Pra testar a posição antes,
troque RANKING_MIN no index.html pra 1.
