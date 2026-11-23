# Phase 6 audit: Muscle Trainer (22 Nov 2026)

Scope: all 229 muscle entries (227 at Expert), their names, origins, insertions and actions; every drawing in every view, layer and close-up.

## 1. Names (Terminologia Anatomica)
All names checked against the Terminologia Anatomica English terms or their common equivalents. Changes:
- Coccygeus -> shown as "Ischiococcygeus (coccygeus)". TA98/TA2 preferred term is ischiococcygeus; coccygeus is the official synonym (IFAA/FIPAT TA98 entity page A04.5.04.011). Both are accepted when typing.
- Accepted as typed answers (official forms): Gemellus superior / Gemellus inferior; Occipitofrontalis and "frontal / occipital belly of occipitofrontalis".
- Kept as commonly taught names (TA treats them as parts or groups): Frontalis, Occipitalis, Erector spinae, Scalenes (both split into their parts from Advanced up).

## 2. Origins, insertions, actions
All entries reviewed. Corrections (verified against Radiopaedia, Elsevier Complete Anatomy, Gray's / Wikipedia):
- Brachioradialis insertion: was "styloid process of the radius" -> "lower outer surface of the radius, just above its styloid process" (dot moved up the radius).
- Pronator teres (ulnar head) origin: was the shared "coronoid process and tuberosity of the ulna" -> "coronoid process of the ulna (inner side)" (new landmark ulncorm).
- Flexor digitorum superficialis (humero-ulnar head): same correction (ulncorm).
- Auricularis superior insertion: "outer surface" -> "upper part of the back (cranial) surface of the ear".
Everything else matched standard anatomy. Origin/insertion conventions that legitimately vary between textbooks (intercostals, vocalis, digastric's two bellies, external urethral sphincter) were left as written.

## 3. Drawing checks (automated)
- New test: every body muscle must lie inside the body outline (<= 8% of its area outside). Found and fixed:
  - Neck outline was too narrow (about two-thirds of real width): widened (affects sternocleidomastoid, splenius capitis, middle scalene).
  - Sternocleidomastoid's upper end was drawn sideways at the edge of the head: redrawn from the mastoid to the sternum and clavicle with two lower heads; moved to the Middle layer because it lies under the platysma.
  - Masseter extended past the jaw: refitted over the ramus of the mandible.
  - Semimembranosus sat too far toward the inner thigh: moved to the back of the thigh, sit bone to inner knee.
  - Deltoid's top was slightly above the shoulder: lowered.
- Infraspinatus was a box: redrawn to fill the triangular infraspinous fossa.
- Re-run after fixes: 752/752 attachment points touched by their muscle; every bone point sits on its named bone; every muscle >= 35% clickable on its own layer; every muscle inside the body outline.

## 4. Visual pass
Front and back at Surface, Middle, Deep, Deepest, and all seven close-ups at each layer: no remaining problems found.

## 5. Regression
At every level: all muscles show info, attachment dots, open to their layer, are found by name and alternative names, give 4 distinct origin/insertion choices, and quiz questions stay within the level. Only the six intended entries changed info (ccg, fds, scm, brach, pron, aurs). Tap quiz: 18/18 correct taps accepted for the changed muscles.

## Known simplifications (by design)
- The body is a schematic; close-ups use their own simplified skeletons/cartilages.
- Families (lumbricals, interossei, etc.) are one entry each; the ~320 figure needs them split (user's choice, not done).
- Bones always draw under muscles except where a muscle is marked "under" (lies behind bone and shows between bones).
