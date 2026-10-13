(() => {
    const files = Array.isArray(window.sharinePhotoFiles) ? window.sharinePhotoFiles : [];
    const grid = document.getElementById('photo-grid');
    const count = document.getElementById('gallery-count');
    const status = document.getElementById('gallery-status');
    const search = document.getElementById('photo-search');
    const filterButtons = [...document.querySelectorAll('.filter-button')];
    const records = files.map((filename, index) => ({
        filename,
        photoId: filename,
        index,
        ...describePhoto(filename, index)
    }));
    let activeFilter = 'all';
    const publishedPhotoIds = new Set();

    function describePhoto(filename, index) {
        const name = filename.toLowerCase();
        const id = Number(name.match(/(\d+)(?=\.[^.]+$)/)?.[1] || 0);
        const wa = Number(name.match(/wa(\d+)/)?.[1] || 0);
        const pictureNumber = Number(name.match(/100000(\d+)/)?.[1] || 0);
        const isScreen = name.startsWith('screenshot_');
        const isVideo = name.startsWith('vid-') || name.startsWith('videoframe_');

        const portrait = (label, description, detail, prompt) => ({ category: 'portrait', label, description, detail, prompt });
        const people = (label, description, detail, prompt) => ({ category: 'people', label, description, detail, prompt });
        const everyday = (label, description, detail, prompt) => ({ category: 'everyday', label, description, detail, prompt });
        const screen = (label, description, detail, prompt) => ({ category: 'screens', label, description, detail, prompt });

        if (isScreen) {
            const savedClips = {
                235659: screen('A sunshine-yellow portrait', 'A bright yellow top and blue knit beanie make this TikTok portrait pop.', 'The close pose brings a hand to the side of the beanie, with an ornate pendant resting against the V-neck. The phone status bar and black margins are still visible around the portrait.', 'What was Sharine doing when she saved this cheerful yellow look?'),
                235705: screen('A seated monochrome look', 'A pale ruffled outfit and knit cap are shown in a black-and-white TikTok still.', 'The subject sits among hanging clothes, one hand at the waist and the other extended toward the edge of the frame. A bright heart sticker floats above the cap.', 'Which detail does Sharine remember first: the outfit, the pose or the clothes around her?'),
                235709: screen('Three views in one collage', 'A vertical collage arranges three black-and-white views of the same pale outfit.', 'One larger portrait fills the left side while two seated versions are stacked on the right. The repeated pose, ruffled sleeve and belt make this saved screen feel like a tiny fashion contact sheet.', 'Which of these three frames would Sharine choose as her favorite?'),
                235714: screen('A dreamy monochrome close-up', 'A close black-and-white portrait is dotted with small crescent-moon effects.', 'The knit cap, pendant and pale ruffled top remain visible beneath the playful filter. The closed eyes and phone interface give this still its own soft, edited look.', 'What made this filter feel right for the photo when Sharine saved it?'),
                235718: screen('A lime-green close-up', 'A close portrait in a light-green dress is saved within a dark phone screen.', 'The face and shoulder fill the central image, with the necklace and fabric edge visible near the bottom. The phone’s black margins keep the saved-screen setting unmistakable.', 'What small detail of this green outfit would Sharine want to keep in her memoir?'),
                235723: screen('A hand-to-cheek pose', 'A light-green outfit, knit cap and beaded bracelet appear in a relaxed phone portrait.', 'The palm supports one cheek while the other arm folds across the body. Colorful hanging garments remain behind the pose, and the phone controls frame the image.', 'Does Sharine remember what was happening around her during this relaxed pose?'),
                235745: screen('A side glance by the clothes rail', 'A seated side pose looks toward the hanging clothes in a bright green outfit.', 'The knit cap, ruffled sleeve and clothing rail all share the composition. The vertical phone framing holds more of the setting than a tight selfie would.', 'Which color in the background would Sharine choose to describe first?'),
                235750: screen('A smiling full-length green look', 'A wide seated pose shows the light-green outfit, dark belt and chair.', 'The subject turns toward the side with hands at the waist. A row of colorful clothes fills the top of the frame, making the outfit’s setting part of its story.', 'What does Sharine remember about styling the belt with this dress?'),
                235754: screen('A close look with a soft filter', 'A close-up brings the knit cap, pendant and green dress into focus.', 'The camera sits near the face, while the clothing rails and small heart graphics remain near the edge. It is a more intimate crop than the standing outfit views in the same set.', 'What did Sharine like about this close framing?'),
                235758: screen('A gentle head tilt', 'A close portrait shows the light-green neckline and a small tilt of the head.', 'The blue knit cap and colorful garment rail return, but this frame shifts closer to the face and shoulders. The saved screen keeps the portrait surrounded by a dark phone interface.', 'What feeling or memory would Sharine choose to attach to this frame?'),
                235803: screen('A quiet leaning pose', 'A head rests against an arm in this close, softly colored portrait.', 'The green outfit, knit cap and hanging fabrics are still visible, with a beaded bracelet near the lower edge. The leaning pose gives this saved frame a quieter composition than its standing companions.', 'What would Sharine call this quiet moment in her own words?')
            };
            const stamp = Number(name.match(/-(\d{6})_tiktok/)?.[1]);
            if (savedClips[stamp]) return savedClips[stamp];
        }

        if (isScreen || isVideo) {
            if (/235659|235705|235709|235714|235718|235723|235745|235750|235754|235758|235803/.test(name)) {
                return screen('A saved TikTok moment', 'A portrait preserved inside a TikTok screen.', 'The vertical image sits within the dark phone interface, with its controls and borders still visible. The saved screen keeps the look and feel of watching a short clip, not just the portrait that appeared inside it.', 'A sweet little time capsule: what was happening when you paused or saved this clip?');
            }
            if (name.includes('videoframe_4912')) {
                return screen('Two faces, one frame', 'A split-screen close-up brings two faces into the same vertical image.', 'The frame is divided down the middle: one close-up wears a patterned head covering, while the other shows a person in a colorful sports shirt. A short relationship label is embedded near the bottom, making this feel like a captured social-video moment rather than a standalone portrait.', 'Which details in this saved frame would you like people to notice, and what is the story behind it?');
            }
            if (name.includes('vid-20250914')) {
                return screen('Blue-and-pink portrait still', 'A softly colored still shows a close portrait in blue and pink.', 'The face and upper body fill the frame, with the bold blue and pink clothing carrying most of the color. The close crop gives this saved still an intimate, immediate quality, like a small pause in a longer recording.', 'What was happening just before this frame, and which tiny detail makes you smile now?');
            }
            if (name.includes('vid-20251212')) {
                return screen('A quiet monochrome still', 'A black-and-white close-up holds a calm, unhurried pose.', 'The image is framed closely around a face and shoulders. Its monochrome treatment softens the background and turns attention toward the simple expression and the lines of the portrait.', 'Was this a favorite frame from a video, or did the moment take on a life of its own?');
            }
            return screen('A moment caught on screen', 'A familiar portrait appears within the framing of a phone capture.', 'The black screen border and app controls remain around the central image, preserving the way it was viewed on a device. Those screen details make this an archive of both the portrait and its digital life.', 'What made this saved screen worth keeping in the collection?');
        }

        if (name === '1000002299.jpg') {
            return everyday('A treasured timepiece', 'A close-up turns a wristwatch into the whole story of the frame.', 'The round gold-toned watch face and dark bracelet fill the picture, with a small charm resting beside it. This unusually detailed object portrait adds a little everyday sparkle to an archive otherwise full of faces and outfits.', 'Whose watch is it, and is there a memory or a person attached to it?');
        }
        if (name === '1000002381.jpg') {
            return everyday('A small hand detail', 'The lens moves in close to a hand and its delicate adornment.', 'Instead of a face or full outfit, this frame focuses tightly on fingers and a tiny piece of jewelry. Its intimate crop makes a quiet detail feel worthy of its own page in the scrapbook.', 'What is the story behind this little detail, and why did someone want to remember it?');
        }
        if (/100000247[6-9]\.jpg|100000248[0-5]\.jpg/.test(name)) {
            return people('Together in an indoor room', 'Several frames show a person seated in a wheelchair, with others and the room around them.', 'The repeated indoor views preserve the seated person, nearby companions, furniture and the warm-colored walls. Each image offers a slightly different arrangement of the same visible setting, without assuming anyone’s relationship or health story.', 'If Sharine wants to share this memory, who would she like to identify and what should the reader know about this visit?');
        }
        if (/1000002507\.jpg|1000002508\.jpg|1000002509\.jpg/.test(name)) {
            return people('A shared portrait', 'This frame places Sharine beside another person for a close portrait.', 'Two faces share the composition, with a change of color treatment between frames: one version is monochrome and another uses brighter color. The closeness of the framing keeps the attention on the people rather than the background.', 'Who is pictured with Sharine, and what would she like to remember about this moment together?');
        }
        if (/1000002279\.jpg|1000002280\.jpg|1000002228\.jpg/.test(name)) {
            return people('Faces in a busy place', 'A few smiling faces gather in a close group portrait.', 'The framing catches several people at once, with the surrounding shop display and roof structure still in view. It feels like a quick shared snapshot: the background remains part of the memory, not something cropped away.', 'Who would Sharine name in this photo, and what was the group doing when the camera came out?');
        }
        if (pictureNumber >= 2223 && pictureNumber <= 2233) {
            const details = [
                ['A bright blue portrait', 'Blue fabric is layered with pink and yellow patterning in a close seated pose.', 'The hand rests near the chin and the patterned shirt becomes the frame’s boldest detail.'],
                ['A colorful look in the light', 'The same vivid blue-and-pink palette returns in a more open portrait.', 'The seated pose gives the image an easy, unhurried feeling, with color running from the collar through the sleeves.'],
                ['A full seated portrait', 'The blue patterned outfit is shown from further back, with more of the seated pose in view.', 'The wider framing lets the saturated fabric and relaxed posture share the attention.'],
                ['A thoughtful pose', 'A raised hand and a gentle turn of the head change the familiar portrait into a different moment.', 'The bright patterned sleeve gives this pose its cheerful splash of color.'],
                ['Pattern against the outdoors', 'A blue and magenta shirt stands out against leafy greenery.', 'The contrast between vivid clothing and the soft green background makes this portrait especially lively.'],
                ['Under the covered walkway', 'A red-trimmed awning creates a simple horizontal backdrop behind a blue patterned look.', 'The straight line above and the relaxed stance give this frame a more spacious feel.'],
                ['A second look beneath the awning', 'The familiar outfit appears again with a changed glance and hand position.', 'Small differences in pose make this companion portrait feel like its own moment.'],
                ['A friendly group snapshot', 'Several faces appear together beneath the structure of a busy covered space.', 'A wider camera angle preserves the people and the setting around them.'],
                ['A close, playful portrait', 'A hand lifted to the chin adds a personal gesture to the colorful shirt.', 'The crop keeps attention on the face and the pink-and-blue pattern at the collar.'],
                ['A smile from the shop', 'Sharine is pictured with companions among shelves and goods.', 'The busy backdrop gives this group snapshot a sense of place and everyday activity.'],
                ['A final colorful angle', 'The blue, pink and yellow shirt returns in a fresh close-up.', 'A different glance and crop give this last frame its own character.']
            ];
            const item = details[pictureNumber - 2223] || details[0];
            return portrait(item[0], item[1], item[2], 'A lovely reminder of how one outfit can hold several different poses. What does Sharine remember about the day these photos were taken?');
        }
        if (pictureNumber >= 2317 && pictureNumber <= 2342) {
            if (pictureNumber === 2317 || pictureNumber === 2340 || pictureNumber === 2341 || pictureNumber === 2342) {
                return portrait('Monochrome, from head to toe', 'A black-and-white frame gives a full outfit and pose a timeless look.', 'The portrait includes more than a face: clothing, stance and the room around it remain visible. The grayscale finish pulls the scene together in soft contrasts and makes the pose feel like a little page from a personal album.', 'Which detail from this quieter, monochrome portrait would Sharine want to keep in her story?');
            }
            return portrait('A simple portrait in dark clothing', 'A dark outfit stands out in a straightforward indoor portrait.', 'The uncluttered pose lets the shape of the clothing and the subject’s stance lead the eye. The image feels like a personal snapshot made for the archive rather than a formal studio sitting.', 'What was the occasion for this portrait, and what did Sharine like about this look?');
        }
        if (pictureNumber >= 2347 && pictureNumber <= 2353) {
            const looks = [
                'A full-length look against a leafy garden wall, with one hand at the waist.',
                'A standing portrait in dark clothes beside a patterned outdoor gate.',
                'A second garden pose, this time with the body turned slightly to the side.',
                'A wider view among garden greenery, with the figure small against the setting.',
                'A vertical frame that includes the gate, grass and complete dark outfit.',
                'A closer outdoor pose with one hand resting at the waist.',
                'A low-angle portrait that places the bright garden above the subject.'
            ];
            return portrait('Outdoors in a dark look', 'The archive shifts outdoors for a full-length portrait in dark clothing.', `${looks[pictureNumber - 2347]} The greenery and patterned gate stay in the picture, making the setting part of the composition.`, 'A lovely little glimpse of a day outside. What was happening around Sharine when these portraits were taken?');
        }
        if (pictureNumber >= 2366 && pictureNumber <= 2390) {
            if (pictureNumber === 2381) return everyday('A little jewelry close-up', 'A hand and small accessory become the subject of this close crop.', 'The camera moves away from the face and lingers on a tiny personal detail instead. That change of scale gives the gallery a gentle pause among the portrait frames.', 'What does this small detail mean to Sharine?');
            if (pictureNumber === 2368) return portrait('A playful phone edit', 'A close selfie is decorated with a bright outline drawn around the face.', 'The bright ring and the phone-effect styling make this feel like an image made for fun rather than a formal portrait. The blue sleeve is still visible beneath the edit.', 'Does Sharine remember choosing this effect, or the conversation that went with the photo?');
            if ([2366, 2388, 2390].includes(pictureNumber)) return portrait('A mirror outfit portrait', 'A pink crop top and patterned skirt appear in a full-length mirror portrait.', 'The phone and mirror reflection remain visible, showing how this outfit picture was made. The strong pink top and dark floral skirt make a memorable contrast.', 'What made this outfit feel special that day, and where was Sharine getting ready?');
            return portrait('A candid portrait in a dark top', 'A close portrait catches a casual pose and a favorite piece of jewelry.', 'The framing shifts between close-up and half-length views, with the background kept simple and the neckline details easy to notice.', 'What does Sharine remember about the look or the moment behind this candid shot?');
        }
        if (pictureNumber >= 2429 && pictureNumber <= 2459) {
            if (pictureNumber <= 2448) {
                const looks = [
                    'A dark lace top and bold necklace are framed by a light curtain.',
                    'The red necklace becomes the brightest detail against a black lace outfit.',
                    'A closer crop puts the face, necklace and raised hand together.',
                    'A slight turn changes the portrait while keeping the red necklace in view.',
                    'A softly lit pose shows the dark lace fabric from shoulders to waist.',
                    'The same look appears in grayscale, with the necklace translated into contrast.',
                    'A small smile and lifted hand add a new gesture to the portrait set.',
                    'A beaded filter adds a playful shimmer over the face and dark outfit.',
                    'A quiet, straight-on portrait shows the necklace sitting high at the neckline.',
                    'A seated black-and-white pose widens the view to include the patterned skirt.',
                    'The red necklace and dark fabric return in a fresh close crop.',
                    'A reclining angle changes the picture into an intimate, relaxed pose.',
                    'A full seated monochrome frame shows more of the room and outfit.',
                    'A small paper detail is held up toward the camera in this close portrait.',
                    'A low camera angle and open blue sky brighten the portrait.',
                    'A bent elbow and turned shoulder make this another distinct casual pose.',
                    'A full-length black-and-white frame shows the outfit without color distractions.',
                    'The red accent returns as the face turns toward the light.',
                    'An upright portrait brings the necklace and patterned top into focus.',
                    'A wider frame gives the lace outfit room to show its texture.'
                ];
                return portrait('A personal portrait in dark lace', 'A series of close and full-length portraits explores the same dark lace look.', `${looks[(pictureNumber - 2429) % looks.length]} The shifts in crop, light and posture give every frame its own gentle character.`, 'Which of these small pose changes feels most like Sharine, and what was the story of this outfit?');
            }
            return portrait('A blue look against warm brick', 'A blue outfit is photographed against a vivid terracotta-colored wall.', 'The warm wall and cool clothing create a striking color contrast. Some frames bring the camera close to the face, while others include more of the standing pose and wall.', 'What does Sharine remember about this place, and which version of the pose would she choose for her book?');
        }
        if (pictureNumber >= 2476 && pictureNumber <= 2485) {
            return people('A visit shared indoors', 'A sequence of indoor snapshots shows people gathered in a warm-colored room.', 'The room, chairs and nearby companions remain visible around the seated figures. The camera angle changes from frame to frame, preserving a lived-in scene rather than a single arranged portrait.', 'What would Sharine like to tell readers about this gathering, and who should be named with permission?');
        }
        if (pictureNumber >= 2507 && pictureNumber <= 2523) {
            if (pictureNumber <= 2510) return people('Two people in the same frame', 'A close two-person portrait changes from soft color to black-and-white and back again.', 'Both faces remain close to the camera, while small changes in framing and color treatment give each version a different keepsake quality.', 'Who is pictured with Sharine, and what sweet detail about this shared moment should the memoir keep?');
            if (pictureNumber === 2511 || pictureNumber === 2516 || pictureNumber === 2517 || pictureNumber === 2519) {
                return portrait('A monochrome outfit study', 'Black-and-white turns this patterned top and light skirt into a study of shape and pose.', 'The photos show varied angles, from a seated sideways turn to standing poses near the hanging fabrics. With color removed, the contrast between the patterned top and pale skirt becomes the main visual rhythm.', 'Which pose feels most natural to Sharine, and how would she describe the clothes in her own words?');
            }
            return portrait('A patterned top and light skirt', 'A patterned sleeveless top is paired with pale trousers in a series of indoor outfit photos.', 'The camera follows a standing pose through several angles, with hanging clothes and the room visible behind. Each photograph shifts the shoulder, gaze or camera distance enough to make this look its own moment.', 'What would Sharine like to remember about choosing this outfit?');
        }
        if (pictureNumber >= 2535 && pictureNumber <= 2539) {
            return portrait('A portrait in a dark fitted look', 'A close and full-length sequence shows a dark outfit in grayscale.', 'The contrast-heavy treatment brings out the silhouette and pose against a simple indoor background. The changing camera distance makes this feel like several playful attempts at one look.', 'Was this a planned outfit session or a spontaneous set of photos? What detail would Sharine add?');
        }
        if (pictureNumber >= 2540 && pictureNumber <= 2542) {
            return portrait('A blue basketball jersey', 'A blue sleeveless sports jersey appears in bright outdoor portraits.', 'The sky and leafy surroundings create a light background for the bold team-style top. One close-up brings a hand near the forehead; another turns the face toward the camera.', 'Does sport have a place in Sharine’s everyday life, or was this simply a look she enjoyed?');
        }
        if (pictureNumber >= 2583 && pictureNumber <= 2583) {
            return portrait('A colorful patterned outfit', 'A bright magenta-and-green patterned top makes this close portrait sing with color.', 'One arm rests near the head, bringing a gentle diagonal into the pose. A small decorative mark appears over the photo, like a playful social-media finishing touch.', 'What is Sharine’s favorite color or pattern in this outfit?');
        }
        if (pictureNumber >= 2592 && pictureNumber <= 2601) {
            if (pictureNumber >= 2603) return portrait('A striped look beneath a stair rail', 'The blue-and-brown checked jacket and striped shirt appear beside metal rails.', 'The low, upward camera angle makes the railings a strong geometric backdrop. Different shots move between a head-and-shoulders crop and a longer view of the layered outfit.', 'Which angle does Sharine like best, and what does she remember about this outfit?');
            return portrait('A striped dress and checked jacket', 'A striped dress is layered with a checked jacket in a series of indoor and outdoor portraits.', 'The set moves from a standing full-length view to closer portraits by a metal railing. Tiny heart graphics appear on some frames, adding a playful saved-photo touch to the varied poses.', 'What did Sharine enjoy about styling these patterns together?');
        }
        if (pictureNumber >= 2603 && pictureNumber <= 2608) {
            if (pictureNumber === 2605) return portrait('A low-angle portrait beneath open sky', 'A vivid pink-and-orange patterned outfit is seen from below against a bright blue sky.', 'The upward view makes the clouds, leafy tree edge and fabric pattern share the frame. It feels open and breezy, quite unlike the close indoor portraits elsewhere in the album.', 'Where was Sharine when this picture was taken, and what was the sky like that day?');
            if (pictureNumber === 2606 || pictureNumber === 2608) return people('A playful close-up with a friend', 'Several faces come together in a close portrait, with one person partly in a cow-print top.', 'The crop leaves little empty space: expressions and patterned fabric fill almost the whole image. Small heart icons at the top add a cheerful, shared-photo finish.', 'Who is pictured here, and what was the fun part of taking this photo together?');
            return portrait('A portrait in mixed patterns', 'A checked outer layer sits over a striped shirt in a close portrait.', 'The camera looks upward toward the face, so the metal lines of the railing frame the pose from behind. The layered patterns are the little styling detail that makes this image stand out.', 'Does Sharine remember what she liked most about this look?');
        }
        if (pictureNumber >= 2610 && pictureNumber <= 2618) {
            if (pictureNumber === 2610) return portrait('A hand raised toward the camera', 'The close frame draws attention to a raised hand and a dark patterned shirt.', 'The hand crosses the upper part of the portrait, making gesture the first detail to notice. The low-angle crop and saturated light add a spontaneous, phone-photo feel.', 'Was this pose planned, or did Sharine just decide to have fun with the camera?');
            if (pictureNumber === 2611) return portrait('A portrait with a hood and printed mark', 'A pink garment and hood frame the face, with a decorative word across the image.', 'The close crop and visible overlay make this feel like an edited keepsake from a social feed. The color treatment changes the mood from the unfiltered portraits around it.', 'What would Sharine like to tell us about the edit or the outfit?');
            if (pictureNumber === 2613 || pictureNumber === 2614) return portrait('A sportswear selfie', 'Casual sportswear and a close camera angle give these portraits a relaxed feel.', 'One frame includes a dark shirt with a pale graphic; another shows blue sportswear and a cap. The close crop keeps the face and favorite everyday details in view.', 'Which of these casual looks feels most like Sharine off-camera?');
            return portrait('A playful pose in changing light', 'A close portrait shifts through purple-tinted light and casual hand gestures.', 'The angle and color treatment change between frames, while the hand near the forehead or cheek gives each pose its own rhythm.', 'What does Sharine remember about this photo session, and which frame makes her smile?');
        }
        if (pictureNumber >= 2621 && pictureNumber <= 2628) {
            if (pictureNumber >= 2621 && pictureNumber <= 2624) return portrait('A bucket hat and sports shirt', 'A patterned bucket hat appears with a light sports jersey in outdoor portraits.', 'The brim shades the face in some frames while a leafy, open-air background remains visible. A grayscale version offers a quieter take on the same relaxed look.', 'What did Sharine enjoy about this hat or jersey, and where was she wearing it?');
            if (pictureNumber === 2625) return portrait('A quiet seated pose', 'A dark outfit and knit hat are photographed near a patterned curtain.', 'The hand rests near the face as the subject leans into a relaxed seated pose. Soft indoor light lets the texture of the fabric and background carry the scene.', 'What would Sharine call this quiet moment in her own words?');
            if (pictureNumber === 2626 || pictureNumber === 2627) return portrait('A black-and-white indoor portrait', 'The room and curtain stay visible in these monochrome portraits.', 'A dark top, seated posture and a small turn of the head create two different compositions. Without color, the patterned curtain becomes a graphic backdrop.', 'Which details of the room should accompany this memory, and which should stay private?');
            return portrait('A knit hat and covered smile', 'A close black-and-white frame catches a knit hat and a hand near the face.', 'The crop makes the knit texture and expressive pose the main details. Its gentle monochrome finish feels different from the brighter fashion shots in the same archive.', 'What was happening when Sharine made this pose?');
        }
        if (pictureNumber >= 2629 && pictureNumber <= 2638) {
            if (pictureNumber === 2629) return screen('A portrait within a phone interface', 'A close portrait appears within the visible borders of a phone app.', 'Interface bars and controls remain in the saved image, making this a record of how the picture appeared online as well as of the portrait itself.', 'What about this saved post would Sharine want a memoir reader to see?');
            if (pictureNumber === 2633) return people('A collage of portraits', 'Several small portrait panels are assembled into one collage.', 'The layout places separate images side by side, giving the viewer more than one glance at the people shown. It is a keepsake made from a collection rather than one single camera moment.', 'Which picture in the collage holds the strongest memory for Sharine?');
            if (pictureNumber === 2637) return portrait('A tiny monochrome portrait', 'A tightly framed black-and-white face stands out against a soft background.', 'The unusually close crop brings the eyes and expression forward while leaving very little of the surrounding scene. Its simplicity makes it a small, memorable pause in the gallery.', 'What does Sharine notice first when she looks back at this portrait?');
            if (pictureNumber === 2638) return portrait('A patterned cap portrait', 'A close portrait pairs a patterned head covering with casual clothing.', 'The crop holds the face and a little of the outfit, keeping the focus on the look rather than on the location.', 'When did Sharine like wearing this head covering, and how would she describe its pattern?');
            return people('A portrait shared with someone close', 'A few images show Sharine alongside a younger person in everyday settings.', 'The frames include a child and an adult together, sometimes facing the camera and sometimes reacting to one another. The photos preserve closeness without assigning a family relationship from appearance alone.', 'Who would Sharine like to name here, and what can she share about the day?');
        }
        if (pictureNumber >= 3210 && pictureNumber <= 3230) {
            if (pictureNumber === 3214) return people('A seated portrait with a child', 'An adult and a child sit close together, both included in the same portrait.', 'The smaller figure wears a bright green top while the adult wears darker clothing. Their shared seat and close framing make this a warm family-album-style image, with the relationship best named by Sharine.', 'Who is pictured here, and what does she remember about sitting together?');
            if (pictureNumber === 3217) return portrait('A cheerful seated pose', 'A dark sweater and bright heart graphics frame a smiling portrait.', 'The subject lifts both hands in an expressive gesture, while the colorful icons add a playful digital touch near the top of the photo.', 'What was the joke, song or thought behind this animated pose?');
            if (pictureNumber === 3210 || pictureNumber === 3213 || pictureNumber === 3218) return people('Two generations in one frame', 'An adult and a small child appear together in a close portrait.', 'The child’s bright clothing and the adult’s patterned outfit create a colorful contrast. The images catch affection and shared attention, while leaving the exact relationship for Sharine to tell.', 'What would Sharine like to remember about being together in this moment?');
            return portrait('A relaxed close-up', 'A close portrait focuses on the face, with the clothing and background kept softly in view.', 'The camera is near enough to show a particular expression and the texture of the outfit. The small decorative effects in some frames give the image a personal, phone-album quality.', 'What tiny detail does Sharine remember about the moment outside the frame?');
        }
        if (name.startsWith('20250906_')) {
            if (/153149/.test(name)) return portrait('A number-thirteen jersey', 'A full-length portrait shows a white jersey with a large red number 13.', 'The subject stands inside a shop with boxed items on the shelves and a glass counter nearby. The number and red sleeve accents are the clearest details against the warm indoor background.', 'What is the story behind this jersey and the day this shop portrait was taken?');
            if (/155052|155200|155536|171610|180755|180810|180855|180938|181602|181631|182237|182316|182359/.test(name)) return people('A day among shop shelves', 'People are photographed among product displays, counters and the everyday activity of a shop.', 'The sequence shifts between a red football jersey, friends sharing the space, and views of the counter or shelves. Each frame keeps its surroundings visible, giving the portraits a clear sense of place.', 'Who would Sharine name in this set, and what was happening at the shop that day?');
        }
        if (name.startsWith('20251212_')) {
            if (/083519/.test(name)) return portrait('A racket and a sports shirt', 'A green racket is lifted beside a red-and-black national-team-style jersey.', 'The badminton racket, patterned head covering and shop shelves all stay visible in the portrait. Its bright green frame draws the eye first, then leads back to the smiling face and sports colors.', 'Was this a favorite game or simply a playful pose? What would Sharine add to the picture’s story?');
            return portrait('A red-and-black football look', 'A red-and-black sports shirt becomes the center of a close portrait.', 'The top carries bold lettering and a team crest, while shelves of goods create a busy backdrop. A small change in expression or distance from the camera makes this companion frame feel personal.', 'What does Sharine remember about this shirt or the setting around her?');
        }
        if (name.startsWith('20251224_') || name.startsWith('img-20251224')) {
            if (/0005|0006|0007/.test(name)) return people('Three friends in a shared snapshot', 'Three young people gather close together in a sequence of friendly portraits.', 'One frame catches a hand raised in greeting, another holds all three faces close to the camera, and a third turns the group to a new angle. Matching everyday clothes and the shared smile make these images feel like companion keepsakes.', 'Who would Sharine like to name, and what was the happiest detail from being together?');
            if (/0008/.test(name)) return portrait('A quiet moment outdoors', 'A seated portrait is framed by leafy plants and a paved garden path.', 'The subject wears a dark top and shorts, with greenery filling the background. The relaxed seated posture brings a pause between the brighter outfit portraits in the archive.', 'What made this a good place to pause that day?');
            return portrait('A close portrait in a light patterned top', 'A pale patterned top and a small decorative heart mark frame this close portrait.', 'The cropped image focuses on the face and shoulders, while colorful fabric and soft indoor light remain around the edges.', 'What did Sharine like about this look, and what was happening just outside the frame?');
        }
        if (name.startsWith('2025-12-11')) return screen('A sideways video still', 'A horizontal moment sits sideways inside a narrow saved frame.', 'The black bars and rotated orientation show this image was preserved from a video or phone display. Even with the unusual framing, the close portrait remains easy to recognize as the subject of the saved moment.', 'Why was this frame saved, and what would Sharine like readers to know about it?');
        if (name.startsWith('20250902-') || name.startsWith('847c757f')) return portrait('A portrait from an earlier photo set', 'A close portrait pairs colorful clothing with a softly lit, intimate crop.', 'The short framing brings attention to the face and neckline, with the clothing pattern providing most of the color. The archive holds a range of portrait styles, and this one keeps the mood simple and personal.', 'What would Sharine call this chapter of her style, and what does she remember about the image?');
        if (name.startsWith('img-20250511')) return portrait('A black-and-white portrait', 'A dark sleeveless top and small pendant stand out in a softly lit monochrome portrait.', 'The camera catches the subject from chest to head, with simple indoor details behind. Grayscale draws attention to the neckline decoration and the calm, direct framing.', 'What memory would Sharine like to keep beside this early portrait?');
        if (/img-20250517-wa018[234]/.test(name)) return people('A close portrait with family nearby', 'A woman and a younger person appear close together in bright pink clothing.', 'The camera catches their faces and shoulders in a close indoor pose. The matching vivid color makes this a warm shared portrait, while the family connection should be described in Sharine’s own words.', 'Who is pictured, and what does Sharine remember about being together?');
        if (/img-20250520/.test(name)) return portrait('A pink patterned look', 'A pink patterned top appears in several close portraits with a delicate necklace.', 'These frames vary between a hand near the forehead, a gentle side turn and a straight-on pose. A few versions keep the phone camera interface visible, revealing the playful process behind the pictures.', 'Which pose feels most like Sharine, and what was she doing when the photos were taken?');
        if (/img-20250526-wa0000/.test(name)) return portrait('A red dress for a full-length portrait', 'A long red dress is shown from head to toe in front of a plain wall.', 'A decorative heart effect floats above the pose, making this feel like an image prepared to be shared. The simple background keeps the dress and its long silhouette in focus.', 'What occasion, if any, was the dress for? Let Sharine supply the story behind it.');
        if (/img-20250526-wa0001/.test(name)) return portrait('A black embellished outfit', 'A dark outfit with bright linear decoration is photographed against a fabric backdrop.', 'The high-contrast lines make the outfit’s surface the most eye-catching detail. The subject holds a relaxed standing pose, with the full silhouette visible.', 'What details did Sharine love about this outfit when she wore it?');
        if (/img-20250526-wa000[234]|img-20250526-wa00(24|25|27|30|32|38)/.test(name)) return portrait('A monochrome style portrait', 'Black-and-white frames show a mix of seated and standing poses in dark clothing.', 'The range includes a relaxed hand-near-face close-up, a seated pose and a standing full-length view. Grayscale makes the different silhouettes and body language the main details.', 'Which pose or outfit would Sharine want to revisit in her own words?');
        if (/img-20250526-wa00(36|37)/.test(name)) return portrait('A seated indoor pose', 'A dark outfit and a seated pose are framed in a plain indoor setting.', 'The visible chair, floor and simple wall give the image a documentary feel. The different camera positions make the companion frames distinct without changing the relaxed setting.', 'What was the room being used for, and what does Sharine remember about this day?');
        if (/img-20250529-wa0000/.test(name)) return people('A little face in the frame', 'A small portrait is placed beside a reclining figure in a playful composite image.', 'The picture combines a child’s face with a larger black-and-white scene, so it reads like an edited collage rather than a single photograph.', 'Who created this playful edit, and what would Sharine like to say about it?');
        if (/img-20250529-wa0001/.test(name)) return people('A family-photo collage', 'Several faces are assembled together in a small, colorful collage.', 'The composite brings a woman and a child into the same little keepsake, with a decorative border and text still visible. It is the arrangement itself—not one camera moment—that makes this image distinctive.', 'Who would Sharine like to name in this collage, and what does each image bring back?');
        if (/img-20250612-wa0000/.test(name)) return people('A caring moment indoors', 'Two people sit close together, one wearing a face mask and the other leaning nearby.', 'The sofa and room remain visible around them, keeping this personal snapshot grounded in an everyday interior. The photograph alone cannot explain the circumstances, so Sharine can decide what to share.', 'What would Sharine like readers to know about this moment, if anything?');
        if (/img-20250612-wa0001/.test(name)) return portrait('A pale dress in an outdoor portrait', 'A light, ankle-length dress is shown against a plain textured outdoor wall.', 'The full-length composition leaves plenty of wall around the figure, making the simple pose and flowing fabric easy to see.', 'Where was the photograph taken, and what does Sharine remember about wearing the dress?');
        if (/img-20250609-wa0117/.test(name)) return everyday('A pair of initial pendants', 'Two small heart-shaped pendants, marked with letters, rest on a hand.', 'The close crop shows fine gold-colored chains and the tiny letter details. It is a personal keepsake photograph about jewelry rather than a conventional portrait.', 'What do the initials stand for, and what memory would Sharine like to attach to them?');
        if (/img-20250807-wa0082/.test(name)) return everyday('A tabletop snapshot', 'A colorful arrangement of drinks, a phone and small personal items is photographed from above.', 'The tabletop is covered with everyday objects, including brightly colored bottles and a screen. The bird’s-eye angle turns an ordinary surface into a record of what was nearby.', 'What were these things gathered for, and which object brings back the clearest memory?');
        if (/img-20250828-wa0229|img-20250828-wa0230/.test(name)) return portrait('A striped dress in grayscale', 'A sleeveless striped dress appears in a black-and-white outdoor portrait.', 'A small bag crosses the body, with the fence and pavement visible in the background. One frame includes more of the full outfit; another gives the same look a fresh angle.', 'What does Sharine remember about this outfit or the place where she wore it?');
        if (/img-20250831-wa0000/.test(name)) return portrait('A mirror selfie in a graphic tee', 'A phone mirror selfie shows a light graphic T-shirt against hanging clothes.', 'The reflection, phone and curtain of garments all remain in the frame. This everyday dressing-space setting makes the picture feel spontaneous and personal.', 'What outfit detail was Sharine checking when she took this mirror photo?');
        if (/img-20250831-wa0117/.test(name)) return portrait('A checked jacket in the shop', 'A checked jacket and light trousers are worn in a seated indoor portrait.', 'The visible shop shelves create a practical, colorful backdrop. The relaxed seated pose contrasts with the neat layered outfit.', 'What brought Sharine to this place, and what did she enjoy about this combination?');
        if (/img-20250902-wa0129/.test(name)) return people('Two portraits side by side', 'A pink portrait and a companion portrait are placed together in a split image.', 'The split composition pairs two faces with different backgrounds and clothing. A decorative social-media mark remains over the image, preserving its playful saved-photo style.', 'Who are the people in the paired images, and what connects these two moments?');
        if (/img-20250902-wa0286/.test(name)) return people('Two sportswear portraits', 'Two portraits in football shirts are arranged side by side.', 'The left portrait uses saturated red and blue tones; the right shows a blue jersey against a shop display. A small graphic label sits near the top of the right-hand image.', 'Who appears in each half, and what is the memory behind putting these portraits together?');
        if (/img-20250905-wa0005|img-20250905-wa0006|img-20250905-wa0008/.test(name)) return portrait('A black-and-white jersey portrait', 'A light jersey with dark trim and trousers is captured in a monochrome setting.', 'The camera varies between a full-length view and a closer standing portrait. The plain tonal treatment lets the number, fabric folds and posture stand out.', 'What was the occasion for this jersey, and which frame best remembers the day?');
        if (/img-20250905-wa0010/.test(name)) return portrait('A pale shirt and bright blue trousers', 'A back-facing pose shows a pale shirt tucked into vivid blue trousers.', 'The portrait is turned away from the camera, emphasizing the outfit from behind and the simple interior around it. It offers a different point of view from the front-facing pictures nearby.', 'Why did Sharine choose this view, and what would she like the reader to notice?');
        if (/img-20250906-wa0363/.test(name)) return people('A sports shirt in a shop', 'A red jersey is photographed among rows of small boxed products.', 'The display-filled background gives this portrait a busy retail setting, while a second person appears nearby in another frame from the same moment.', 'What was happening in the shop, and who would Sharine like to mention?');
        if (/img-20250910-wa0189/.test(name)) return portrait('A bright green top in a fabric shop', 'A light-green top and knit hat stand out among colorful hanging fabrics.', 'The photograph includes clothing rails and patterned textiles all around the subject. A softened blue-and-pink filter gives the familiar indoor setting an extra pop of color.', 'Was Sharine choosing an outfit, visiting the shop or simply posing? What does she remember?');
        if (/img-20250914-wa0188/.test(name)) return portrait('A light sleeveless outfit', 'A light patterned sleeveless top is shown in a close pose beside a doorway.', 'The grayscale crop includes the face, shoulder and textured background. A turned head creates a quiet profile rather than a straight-on portrait.', 'What detail would Sharine want to add to this monochrome moment?');
        if (/img-20250914-wa0191/.test(name)) return portrait('A blue football-shirt pose', 'A blue football shirt and a raised peace sign make this a cheerful casual portrait.', 'The close crop puts the shirt crest, hand gesture and relaxed face together against a bright background.', 'Was the peace sign a favorite pose, and what was happening just before the photo?');
        if (/img-20250914-wa0192/.test(name)) return portrait('A thoughtful black-and-white pose', 'A dark outfit and a hand near the face create a quiet monochrome portrait.', 'The close framing leaves a patterned curtain behind the subject, and grayscale gives the fabric and pose gentle contrast.', 'What would Sharine say about the mood of this photo in her own words?');
        if (wa >= 194 && wa <= 199) {
            const details = {
                194: 'A bright lime-green top and knit cap stand out against a vivid fabric display.',
                195: 'The same lime-green outfit returns in a closer upward-looking pose.',
                196: 'A small smile and a beanie give this portrait a softer, playful angle.',
                197: 'A full-length view shows the lime-green outfit, wide black belt and layered fabrics.',
                198: 'This standing portrait shows the complete look, from knit cap to hem.',
                199: 'The subject turns slightly beside hanging fabrics, revealing another view of the belted outfit.'
            };
            return portrait('The lime-green dress set', 'A vivid green dress with a wide black belt appears in a series of changing portraits.', `${details[wa]} Colorful garments and fabric rails fill the background, turning the setting into part of the styling story.`, 'Which detail did Sharine choose herself, and what would she like to remember about getting dressed?');
        }
        if (wa >= 200 && wa <= 213) {
            if (wa >= 201 && wa <= 202) return portrait('A lemon-yellow top', 'A yellow short-sleeved top appears in a close portrait and a friendly standing pose.', 'The bright color sets off the darker neckline and casual background, while a change of angle makes the companion frames feel different.', 'What did Sharine like about this bright yellow look?');
            if (wa >= 203 && wa <= 210) {
                const details = {
                    203: 'A raised hand frames the face in this white blouse portrait.',
                    204: 'A small smile and a hand-near-cheek gesture soften the close framing.',
                    205: 'The white blouse is shown in a direct chest-up portrait.',
                    206: 'A hand lifted beside the temple gives the pose a playful profile.',
                    207: 'The chin rests near a hand in a calm, thoughtful-looking pose.',
                    208: 'A slightly lower camera angle brings the blouse collar into clearer view.',
                    209: 'A gentle side glance changes the feel of this bright-room portrait.',
                    210: 'The full upper-body view includes the blouse details and colorful display behind.'
                };
                return portrait('A white blouse portrait', 'A white blouse with small dark neckline accents returns in several close poses.', `${details[wa]} A bright fabric display remains behind the subject, giving the pale outfit a colorful edge.`, 'What was Sharine doing when these portraits were taken, and which angle feels most like her?');
            }
            if (wa >= 211 && wa <= 213) {
                const details = {
                    211: 'A close face portrait is accented with bright round stickers across the forehead and cheeks.',
                    212: 'Colorful round face stickers appear across a smiling close-up.',
                    213: 'The face decorations return in another warm-toned close frame.'
                };
                return portrait('A playful sticker-filter portrait', 'Bright circular face stickers add a playful edit to a close portrait.', `${details[wa]} The decoration sits over the face like a fun phone-camera filter, making this a distinctly digital keepsake.`, 'What filter would Sharine choose today, and what made this one fun at the time?');
            }
        }
        if (/img-20250914-wa0217|img-20250914-wa0218|img-20250914-wa0219/.test(name)) {
            const details = wa === 217
                ? 'The portrait is tilted beneath an orange metal stair rail, which draws a strong diagonal above the face.'
                : wa === 218
                    ? 'A knit cap and striped outer layer are framed against the same warm orange structure.'
                    : 'The camera shifts to a more upright view, keeping the cap and layered top in focus.';
            return portrait('A knit cap beneath orange rails', 'A dark knit cap and striped layers make a cozy contrast against a vivid orange outdoor structure.', `${details} The shared setting ties these neighboring portraits together while each camera angle gives the pose a different little spark.`, 'What does Sharine remember about wearing this look outdoors?');
        }
        if (/img-20250914-wa0220|img-20250914-wa0221/.test(name)) return people('A close group in bright clothes', 'Several people lean into a colorful close-up, with green and dark tops visible.', 'The overhead angle and tightly grouped faces make this feel like a quick shared selfie. The colorful garments and small sticker effects add to its cheerful photo-album quality.', 'Who was there, and what made everyone gather for a quick picture?');
        if (/img-20250918-wa0212/.test(name)) return people('Two people in a shop doorway', 'Two people appear together in a doorway surrounded by shop displays.', 'The wider vertical frame captures both the people and the shelves, preserving the everyday place as part of the snapshot.', 'Who would Sharine like to name, and what brought them to this place?');
        if (/img-20250915-wa0112/.test(name)) return portrait('A mirror photo among clothes', 'A full-length mirror selfie shows a striped outfit in a busy room of hanging clothes.', 'The mirror reflection and phone remain central, while fabric bundles and garments crowd the edges. The room’s bustle gives this outfit photo a candid, lived-in quality.', 'What was Sharine looking for or trying on when she took this mirror picture?');
        if (/img-20251101-wa0091|img-20251211-wa0000|img-20251211-wa0144/.test(name)) return portrait('A mirror outfit snapshot', 'A phone reflection shows a colorful outfit in a room lined with fabrics and everyday objects.', 'The mirror, phone and crowded background make this a practical getting-ready portrait rather than a studio image. Each item around the reflection adds texture to the room.', 'What does Sharine remember about the outfit and what she was doing just before the photo?');
        if (/img-20250514-wa0019/.test(name)) return portrait('A black tee in a shop', 'A dark T-shirt with a large pale wordmark is worn in a close portrait.', 'Product displays fill the background, and the hand-near-chin pose turns the image into a casual shop snapshot. The shirt lettering is the most eye-catching detail.', 'What did Sharine like about this shirt, and why was she at the shop that day?');
        if (/img-20250828-wa0231|img-20250828-wa0232/.test(name)) return portrait('A striped dress by a railing', 'A striped dress and small crossbody bag are shown in soft monochrome portraits.', 'The metal railing and outdoor wall remain visible behind the figure. One photograph shows more of the full stance while its companion shifts the camera angle.', 'What would Sharine like to preserve about this outfit or the place?');
        if (/img-20250522-wa0051/.test(name)) return portrait('An outdoor sports-shirt portrait', 'A white sports jersey and bucket hat are photographed beneath leafy branches.', 'The upward angle catches bright green leaves behind the subject. The colorful headwear and team-style shirt give this portrait a sporty, lighthearted look.', 'What was the day like outside, and why did Sharine choose this jersey?');
        if (/img-20250606-wa0142/.test(name)) return portrait('A mirror moment in a light dress', 'A light-colored dress appears in a mirror snapshot with a phone held up.', 'The reflection includes a soft, busy indoor background and the phone used to take the picture. A bright pink area at the edge adds a little color to the pale outfit.', 'What detail in the mirror caught Sharine’s eye when she saved this picture?');
        if (/img-20250612-wa0001/.test(name)) return portrait('A long pale dress outside', 'A full-length portrait shows a light dress against a simple outdoor wall.', 'The restrained background gives the dress and the subject’s stance plenty of room. The head-to-toe framing preserves the shape and length of the garment.', 'What occasion was this look for, if Sharine wants to share it?');
        if (/img-20250902-wa0286/.test(name)) return people('Two football-shirt portraits', 'A side-by-side image brings together two football-shirt portraits.', 'A red-and-blue image sits beside a brighter blue-shirt portrait with a small digital sticker. The paired layout turns two separate looks into one shared keepsake.', 'Who appears in each portrait, and what connects the two pictures?');
        if (name === 'sharine1.jpg') return portrait('The blue-and-pink signature portrait', 'A bright blue shirt with bold pink and yellow patterning fills this portrait.', 'The close seated pose, hand beneath the chin and colorful collar make this one of the clearest fashion portraits in the collection. It feels like a natural introduction to a personal style story.', 'What would Sharine like a reader to know about this favorite portrait?');

        const genericOpeners = [
            'A lovely little keepsake from Sharine’s photo collection.',
            'One warm page from Sharine’s growing visual diary.',
            'A personal snapshot, kept for the details it quietly preserves.',
            'A sweet pause in the album, captured just as it appeared.',
            'A bright, personal glimpse from the archive.'
        ];
        const indexCue = genericOpeners[index % genericOpeners.length];
        if (name.startsWith('img-')) {
            return portrait('A personal portrait from the archive', 'A portrait holds one particular outfit, angle and expression in place.', `${indexCue} The background and framing remain visible, but only Sharine can tell us where she was and what the moment meant.`, 'What would she like to remember about the day this picture was taken?');
        }
        if (id >= 20250906 && id <= 20251299) {
            return everyday('A day-to-day scene', 'This photograph keeps the subject and their everyday surroundings in the same frame.', `${indexCue} The setting, clothing and camera angle make this image different from a plain studio portrait, without revealing a whole story on their own.`, 'What happened around the edges of the picture, and what does Sharine remember most?');
        }
        return portrait('A moment from Sharine’s archive', 'A personal portrait preserves a particular pose, outfit and point of view.', `${indexCue} Rather than guess at the occasion, the caption leaves the real memory for Sharine to tell in her own voice.`, 'What would she like to say about the place, people or thought just outside the frame?');
    }

    function makeCard(record) {
        const card = document.createElement('article');
        card.className = 'archive-card';
        card.dataset.category = record.category;
        card.dataset.photoId = record.photoId || record.filename;
        const figure = document.createElement('figure');
        figure.className = 'archive-photo';
        const openButton = document.createElement('button');
        openButton.className = 'archive-photo-open';
        openButton.type = 'button';
        const image = document.createElement('img');
        image.src = record.imageUrl || record.filename;
        image.alt = `${record.description} ${record.detail}`;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.addEventListener('error', () => {
            figure.classList.add('image-unavailable');
            image.alt = 'This portrait could not be displayed in the current browser.';
            status.textContent = 'A portrait could not be previewed, but its description remains available.';
        }, { once: true });
        const caption = document.createElement('figcaption');
        const title = document.createElement('h3');
        const description = document.createElement('p');
        const titleOpenings = [
            'A little color catches the eye —',
            'Soft light meets a thoughtful pose —',
            'A relaxed portrait, full of character —',
            'Bright details bring this frame to life —',
            'A fresh angle makes the moment feel close —',
            'Personal style takes center stage —',
            'Warmth settles gently over the scene —',
            'A sweet expression anchors the picture —',
            'The background adds its own quiet charm —',
            'A lively palette gives the portrait a lift —',
            'An easy pose feels naturally graceful —',
            'A familiar setting lends the photo its texture —',
            'A simple detail makes this frame memorable —',
            'The composition has a lovely, unhurried feel —',
            'A confident look meets a colorful setting —',
            'Everyday surroundings become part of the portrait —',
            'A playful gesture brings extra personality —',
            'The camera finds beauty in the little things —',
            'A gentle moment shines through the image —',
            'The chosen colors create a striking impression —',
            'A candid angle gives the photo its warmth —',
            'An expressive pose brings the frame together —',
            'A personal style moment, kept in color —'
        ];
        const titleFinishes = [
            'A lovely glimpse into her personal style.',
            'A gentle detail for the pages of her story.',
            'An image with a charm all its own.',
            'A thoughtful portrait from an everyday moment.',
            'A bright note in her visual diary.',
            'A personal memory waiting to be told.',
            'A graceful frame to remember.',
            'A little scene full of personality.',
            'A beautiful moment, just as it appeared.',
            'A sweet portrait with a lasting impression.',
            'A small window into her world.',
            'A keepsake rich in color and character.'
        ];
        const captionReflections = [
            'The small details give this memory its own texture.',
            'Color carries a little of the mood into the present.',
            'A personal touch makes the portrait feel unmistakably hers.',
            'Even the setting has a quiet part to play.',
            'A relaxed pose brings its own kind of grace.',
            'Everyday elegance can be found in the simplest frame.',
            'Light, fabric and expression find a lovely balance.',
            'The image holds a gentle pause in a busy life.',
            'Personality shines brighter than a perfectly arranged backdrop.',
            'A familiar detail can bring a whole day back.',
            'The composition feels as individual as the person in it.',
            'Style often lives in the choices that feel most natural.',
            'A thoughtful glance gives the photograph its tenderness.',
            'The textures in the background make the scene feel lived in.',
            'There is charm in the unhurried way this moment unfolds.',
            'A simple snapshot can become a treasured part of a life story.',
            'The colors leave their own little signature on the memory.',
            'A candid angle brings the portrait gently closer.',
            'This frame celebrates presence rather than perfection.',
            'The image feels like a friendly hello from another day.',
            'Small things, seen clearly, can make the loveliest stories.',
            'A distinct point of view gives the picture its character.',
            'The mood comes through in details words might otherwise miss.'
        ];
        const captionFinishes = [
            'A graceful detail to carry into the next chapter.',
            'A warm presence remains after the picture ends.',
            'The memory belongs to her, in all its lovely specifics.',
            'A tender note for the story she is still writing.',
            'This moment has a softness all its own.',
            'A personal image, full of quiet character.',
            'The little things are often the ones that stay.',
            'A beautiful reminder of how individual style can be.',
            'A lovely scene, held gently in the family album.',
            'The frame keeps its own kind of warmth.',
            'A portrait with room for a memory of her own.',
            'A small, vivid piece of a life unfolding.'
        ];
        const opening = titleOpenings[record.index % titleOpenings.length];
        const finish = titleFinishes[Math.floor(record.index / titleOpenings.length)];
        title.textContent = record.isPublished ? record.title : `${opening} ${record.description} ${finish}`;
        const reflection = captionReflections[record.index % captionReflections.length];
        const afterglow = captionFinishes[Math.floor(record.index / captionReflections.length)];
        description.textContent = record.isPublished ? record.detail : `${record.detail} ${reflection} ${afterglow}`;
        openButton.setAttribute('aria-label', `Open photo: ${title.textContent}`);
        const openHint = document.createElement('span');
        openHint.className = 'archive-photo-open-hint';
        openHint.textContent = 'View photo';
        caption.append(title, description);
        openButton.append(image, openHint);
        figure.append(openButton);
        card.append(figure, caption);
        if (window.sharineCommunity) {
            window.sharineCommunity.addPhotoControls(card, record.photoId || record.filename);
        }
        return card;
    }

    function render(list) {
        grid.replaceChildren();
        const fragment = document.createDocumentFragment();
        list.forEach((record) => fragment.append(makeCard(record)));
        grid.append(fragment);
        count.textContent = `${list.length} of ${records.length} photos`;
        if (list.length === 0) {
            status.textContent = 'No photos match those filters. Try another search or select “All photos.”';
        } else if (list.length === records.length) {
            status.textContent = 'The complete collection is on view.';
        } else {
            status.textContent = `Showing ${list.length} matching archive photos.`;
        }
        window.dispatchEvent(new Event('sharine:gallery-rendered'));
    }

    function applyFilters() {
        const query = search.value.trim().toLowerCase();
        const filtered = records.filter((record) => {
            const matchesCategory = activeFilter === 'all' || record.category === activeFilter;
            const searchable = `${record.label} ${record.description} ${record.detail} ${record.prompt}`.toLowerCase();
            return matchesCategory && (!query || searchable.includes(query));
        });
        render(filtered);
    }

    window.addEventListener('sharine:photos-ready', (event) => {
        const uploadedPhotos = event.detail;
        uploadedPhotos.forEach((photo, offset) => {
            if (publishedPhotoIds.has(photo.id)) return;
            publishedPhotoIds.add(photo.id);
            records.unshift({
                photoId: photo.id,
                filename: photo.image_url,
                imageUrl: photo.image_url,
                index: files.length + offset,
                category: 'everyday',
                label: photo.title,
                title: photo.title,
                detail: photo.description,
                prompt: '',
                isPublished: true
            });
        });
        applyFilters();
    });

    window.addEventListener('sharine:photo-deleted', (event) => {
        const deletedId = event.detail.id;
        const index = records.findIndex((record) => record.photoId === deletedId);
        if (index !== -1) records.splice(index, 1);
        publishedPhotoIds.delete(deletedId);
        applyFilters();
    });

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            activeFilter = button.dataset.filter;
            filterButtons.forEach((option) => {
                const selected = option === button;
                option.classList.toggle('active', selected);
                option.setAttribute('aria-pressed', String(selected));
            });
            applyFilters();
        });
    });
    search.addEventListener('input', applyFilters);

    if (records.length === 0) {
        count.textContent = 'The photo inventory is not available.';
        status.textContent = 'The archive list could not be loaded. Keep gallery-photos.js beside this page and reload.';
        return;
    }
    render(records);
})();
