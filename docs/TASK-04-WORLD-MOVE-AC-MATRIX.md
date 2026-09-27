# Task 04 — reconstructed candidate / independent QA PENDING

Base: c45f3b2d860db1f92efc038d0a94532f818f0f69.
Branch: task/pl-world-04-move-rebuild.
Supersedes unrecoverable candidate 54541131b20b9b1e6f65dbcfbf7dff0a26ba7943. That candidate NEVER passed independent QA. Its 68 local results are historical and provide no verdict for this reconstruction.

Owner authorized reconstruction on 27/09/2026 with unchanged C01–C07, configId T04-DEV-WM-CFG-P01 and 18 AC. No foundation or HS-01 implementation changes. No art, chase consumer, PHÀ ƠI, economy, OCOP, save, recovery or Book. F12 ACCEPTED_WITH_OWNER_WAIVER.

## Original AC (verbatim)

| AC | Given / When | Then — kết quả có thể kiểm thử | Quyết định phụ thuộc |
|---|---|---|---|
| T04-AC01 | Dev entry được chọn; kiểm tra import graph và production preview với cùng query | World module chỉ chạy DEV; production không có harness/debug API/module Task 04; không request asset mới; graph không tới/copy legacy | D01–D02 |
| T04-AC02 | Mount với config hợp lệ trong StrictMode | Một actor, một bộ điều khiển MOVE, một world_ready/run sau validation; ghi configId/session/run; input zero trước ready | D02–D03,D08 |
| T04-AC03 | Config thiếu/sai, spawn ngoài bounds hoặc footprint chồng vật cản; retry bằng config hợp lệ | ERROR không ready/MOVE; không clamp/teleport/fallback âm thầm; retry tạo phiên mới, không hồi callback phiên lỗi | D03,D06,D08 |
| T04-AC04 | Người dùng tác động pointer MOVE trên actor đang ACTIVE; sau đó thả | Actor thật đổi vị trí đúng hướng/magnitude được duyệt; thả thì đứng yên; không chỉ thay diagnostics hoặc tween trang trí | D04–D05 |
| T04-AC05 | Input cùng độ lớn trên trục/chéo; cùng tổng active time với các phân đoạn delta khác nhau, không vật cản | Quãng đường theo vP × magnitude × active time trong sai số được duyệt; không diagonal boost hoặc phụ thuộc số frame | D04–D05 |
| T04-AC06 | Pointer up/cancel/lost capture, blur, thao tác ngoài vùng MOVE, pointer phụ hoặc chạm UI pause | Input về zero khi mất quyền; không tự trôi/nhận tap UI thành MOVE; pointer phụ không cướp active pointer | D04,D08 |
| T04-AC07 | Di chuyển tới mọi cạnh/góc bounds từ nhiều hướng | Toàn footprint ở vùng hợp lệ; không chỉ tâm actor nằm trong bounds; theo response đã duyệt, không teleport | D03,D06 |
| T04-AC08 | Di chuyển cắt vật cản, sát mép/góc; một frame dài có thể vượt bề dày vật cản | Không xuyên đoạn bị chặn; stop/clearance đúng config; không bounce/slide ngoài quyết định; đường thoáng vẫn đi được | D03,D05–D06 |
| T04-AC09 | Resize, letterbox, portrait↔landscape khi đứng yên/đang giữ input | World position/geometry không đổi do CSS; camera/input mapping đúng; gesture mất hiệu lực được clear; không claim F12 PASS | D03–D04,D07–D08 |
| T04-AC10 | Manual pause khi đang MOVE; chờ rồi resume | Position, displacement/active movement time đứng yên khi pause; không catch-up; resume không tự dùng input cũ | D05,D08 |
| T04-AC11 | Hidden/pagehide; manual+hidden cùng bật, gỡ theo cả hai thứ tự | Không MOVE khi còn bất kỳ global pause nào; bỏ manual không xóa hidden và ngược lại; trở lại cần input mới | D08 |
| T04-AC12 | Hai chủ sở hữu giữ khóa MOVE; gỡ từng khóa, xen manual pause | Không MOVE đến khi hết khóa và global pause; unlock không resume engine/xóa khóa khác; không cần giả phase HS-01 | D08 |
| T04-AC13 | Cancel/unmount/route exit trong BOOTING, ACTIVE và PAUSED | Vô hiệu session/run trước cleanup; actor/input/listener/update owned được dọn; hủy không emit completion/chase/capture | D08 |
| T04-AC14 | Restart scene hoặc re-entry ngay; giao lại input/callback từ run/session cũ | Run/session mới không bị sửa vị trí/trạng thái; restart thay run; re-entry thay session và về spawn; không save/resume vị trí cũ | D03,D08 |
| T04-AC15 | 20 vòng mount/move/pause/cancel/re-entry và scene restart | Max live Game ≤1; không nhân actor/controller/listener; tài nguyên Task 04 về zero sau teardown, không callback mồ côi | D08 |
| T04-AC16 | Thực hiện toàn bộ hành động world; quay lại hs-flow chạy đến HANDOFF | Không consumer chase mới, không HeeSun/capture/progression/save/unlock; hs-flow vẫn một request sau cleanup và dừng; voice unbound, không SKIP ALL | D01 |
| T04-AC17 | Chạy MOVE/bounds/obstacle trên AUTO/WebGL, Canvas và AUTO fallback hiện có | Cùng geometry/input semantics, actor nhìn thấy đúng camera; không lỗi console/runtime; kiểm thử browser không thay QA thiết bị thật | D02–D07 |
| T04-AC18 | Bàn giao candidate SHA cho QA | Nguyên 44 test baseline PASS và kết quả test mới báo riêng; AC matrix, đúng SHA/run/artifact; không báo chase/full-flow PASS; F12 vẫn waiver | Tất cả |

## Coverage and independence review

| AC | New scenario IDs | Evidence |
|---|---|---|
|01|N01|Production preview, import guard, dist scan|
|02|N02|Native actor and ownership, StrictMode|
|03|N03,N13|Invalid config/delta and retry|
|04–05|N04,N05,N06,N07|Browser pointer to native actor; formula, speed, no inertia|
|06|N05,N08|Cancellation, fresh gesture, secondary touch|
|07–08|N09,N10,N11,N12|Native pointer bounds/obstacle plus controlled synthetic geometry|
|09|N14|FIT/letterbox/rotation, camera and input|
|10–11|N15,N16|Manual/hidden/pagehide ownership, frozen active time|
|12|N17|Two independent MOVE owners; no engine resume|
|13–14|N18,N19|BOOTING/ACTIVE/PAUSED cleanup, stale generation|
|15|N20|20 full cycles, zero owned resources|
|16|N21|Real reveal/manga handoff remains exactly one request|
|17|N22 (3 variants)|Native WebGL, Canvas, actual AUTO fallback|
|18|Handoff gate|Exact SHA, source and baseline hashes, reports, recovery round-trip, CI status|

Recovered test SHA256: 915f64ea428d645438e456dd859bd482adf5a4701ae16f993ecbefb395618380. The 409-line source was extracted byte-for-byte from the prior trace, not regenerated from memory. It is an input reviewed against the approved spec, not the sole specification. No assertion weakened. 22 scenario IDs expand to 24 tests.

### Explained test revision

At interim SHA 79ffd40065e7a7b8b18ea634b2acb3b0120c2009 the full new suite produced 23 passed / 1 failed (N18 timeout at 90s), with no retries. Nine full-document reloads consumed the budget (each app navigation approximately 10s). A DOMContentLoaded experiment did not solve this and was reverted. N18 now uses the real re-entry API for cancel/unmount and browser history return for route exit between ACTIVE/PAUSED cases. The three BOOTING entries still use cold navigation and delayed real createGame import. All nine mode/state combinations, real pointer MOVE, assertions, resource checks and the 90s timeout remain. This also exercises the same-document foundation teardown barrier instead of resetting that module via reload. The focused revised N18 passed in 41.8s. Final full suites must run again at the new commit; interim results do not certify it. No baseline test changes. Original recovered test hash above identifies the input; candidate test hash is recorded separately in manifest.

The test oracle partitions the trajectory at geometry boundaries and classifies interval midpoints. Runtime collision uses slab entry/exit and bounds exit. No production collision/config import into oracle. Pointer tests observe the real Phaser actor and use accepted raw input plus native Scene delta, never returned MOVE displacement as expected. Synthetic injections cover exact boundary/long delta/stale cases only. Production config validation separately enforces the complete approved fixture.

Native Phaser 4.2.1 Scene UPDATE clock is consumed unchanged. Browser waiting measures accumulated native delta, not wall time. Camera rotation is a documented runtime accessor missing from the installed Camera declaration, read through a narrow typed intersection; engine code is unchanged.

## Durable recovery gate

Before implementation, Task04_Recovery_Preflight.zip was saved and downloaded again with matching SHA256 0efebe5a769fd3ef50a8dcdbd4a9f1897a19e176a886fbfee3c19b79f42e5d28. Final source bundle and new evidence must be persisted and re-downloaded, then restored in a separate checkout with matching HEAD and tree. A baseline-relative bundle requires the exact base above; this prerequisite must be verified during restoration.

Local browser results and CI must be reported separately. No QA PASS is claimed. CI remains BLOCKED when authenticated Git push is unavailable. No PR, merge or release authorized.

## QA-04-001 correction (27/09/2026)

Candidate 1c9c039 received independent QA FAIL / NEEDS_FIX (AC07 numerical contact); CI remained missing. See TASK-04-QA-04-001-FIX.md for the correction and evidence requirements. Config C01–C07 is APPROVED under the opening 27/09 record; historical PROPOSED labels do not reopen it. The 18 AC above remain verbatim.

| AC | Added/strengthened evidence |
|---|---|
|03,07,08|N23 exact QA contact then next update/held/tangent/away; N24 all bounds/obstacle faces/corners; N25 genuine invalid input/runtime positions; N26 real Phaser browser/pointer path|
|13|N18 route exit now shares full disposed resource assertions; delivers old callback and subsequent events without reviving actor, updates or completions|
|18|New exact-SHA results and recovery package required; QA PENDING, CI separately reported|

Current expected count: 26 scenario IDs / 28 Task04 tests (three controlled-controller tests and one new browser test added). Keep 44 baseline tests unchanged. Original 24-test and N18 timing paragraphs above are historical provenance, not current-candidate evidence. No assertions or timeouts relaxed.
