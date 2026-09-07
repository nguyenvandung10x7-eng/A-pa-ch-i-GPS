-- Keep the server-authoritative Guild score catalog aligned with the five
-- Challenge tasks added by the runtime workbook import.
insert into public.guild_score_catalog (challenge_id, points, enabled)
values
  ('quang-truong-7-5-hat-quoc-ca', 120, true),
  ('quan-com-hung-ha-thuoc-lao-free', 100, true),
  ('de-xe-may-ngoai-troi-qua-dem', 180, true),
  ('nhin-xuong-long-chao-cua-chung-ta', 140, true),
  ('tim-cay-xoai-co-thu', 220, true)
on conflict (challenge_id) do update
set points = excluded.points,
    enabled = excluded.enabled,
    updated_at = now();
