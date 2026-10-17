# YouTube Video Extraction: "AI App Animations is Hard Until You Learn This"
**URL**: [https://www.youtube.com/watch?v=f-Ar8mwm3kQ](https://www.youtube.com/watch?v=f-Ar8mwm3kQ)  
**Creator**: Jonny (Senior Staff Software Engineer at Meta / Premium Goblin)  
**Channel / Publication**: Push To Prod ([getpushtoprod.substack.com](https://getpushtoprod.substack.com))  
**Duration**: 22:50 (1,370 seconds)

---

## 1. On-Screen Visual Text & Graphics

### A. The App Animation Cheat Sheet (Slides 13:45 / 22:05)
* **Header**: PUSH TO PROD — The app animation cheat sheet
* **Subheader**: Pick by the job. Combine for the feeling.
* **12 Architectural Grid Cards**:
  1. **Keyframes**: Choreograph a sequence
  2. **Springs**: Make UI feel responsive
  3. **Gestures**: Follow a finger or scroll
  4. **Physics**: Let forces drive motion
  5. **SVG paths**: Draw, morph, follow a line
  6. **Layout transitions** (FLIP / View Transitions): Reorder, expand, connect
  7. **Rive / Lottie** (Rive: states · Lottie: AE workflow): Embed designer-made motion
  8. **Skeletal rigs**: Pose a connected character
  9. **Flipbook / video**: Play finished frames
  10. **Particles**: Celebrate with many pieces
  11. **Shaders**: Transform the pixels
  12. **Combine them**: Move + react + celebrate
* **Footer**: These approaches overlap. This is a starting map, not every technique. | Premium Goblin · getpushtoprod.substack.com

---

### B. Slide Deck ("Bring Your App to Life" · PushToProd)
* **Slide 9/26 — What drives the motion?**:
  * Keyframes, Springs, Gestures, Physics, Layout, SVG paths, Skeletal rig, Rive / Lottie, Flipbook, Video, Particles, Shader, Finish
* **Slide 15/26 — When you finish a puzzle**:
  * *Subtitle*: The controls spring in, the print tilts, and the scene celebrates.
  * *Spring UI*: Bring in the completion controls.
  * *Tilt + damping*: Drag the finished print. It tilts and settles.
  * *Particles*: Floating specks, sparkles, and confetti.
  * *Shader + projection*: Keep the paper's edges clean as it tilts.
  * *Action*: Try the illustrated effects ↗
  * *Caption*: Actual app recording · gesture-driven tilt
* **Slide 17/26 — Always return to rest**:
  * *Subtitle*: The app needs to know when the character is ready again.
  * *State Machine Diagram*: `[ Rest ] -- coffee trigger --> [ Coffee ] -- finished --> [ Rest ]` (with `reset` return arc)
  * *Columns*:
    * **Trigger**: Ask for an action.
    * **State machine**: Choose what plays.
    * **Settled**: Confirm a stable pose.
* **Slide 21/26 — Tests don't catch everything**:
  * *Subtitle*: The widest Squish still clips at the edge.
  * *Checklist*:
    * **Logic**: Did the action finish?
    * **Motion**: Did the pixels actually move?
    * **Acting**: Does the gesture make sense?
  * *Visual caption*: Squish clipping · still to refine

---

### C. Animation Playground (Browser Illustrations)
1. **Keyframes**:
   * *Heading*: Set the poses. Choose the timing.
   * *Description*: Three authored poses, with position, scale, and opacity changing between them.
   * *Controls*: Timeline 2.4s (`0.0s`, `1.2s`, `2.4s`), `Playback 1x`, `Final pose · scrub to explore`.
2. **Springs**:
   * *Heading*: Same target. Different feel.
   * *Description*: Change the damping and feel the difference between a gentle settle and a playful bounce.
   * *Presets*: `[Gentle]`, `[Snappy]`, `[Bouncy]`.
3. **Gestures**:
   * *Heading*: Pick it up. Let it go.
   * *Description*: The card follows your pointer, lifts off the surface, and settles back on release.
   * *Card copy*: "A little moment of joy." Direct manipulation plus spring return.
4. **Physics**:
   * *Heading*: A little gravity goes a long way.
   * *Description*: Balls fall, collide, bounce, and lose energy. Turn up the bounce and drop a few more.
   * *Controls*: `Bounce 75%`, `4 balls · gravity + collisions`.
5. **SVG paths**:
   * *Heading*: Animate the geometry itself.
   * *Description*: Draw a line, reshape a silhouette, follow a curve, or reveal through a mask.
   * *Modes*: `[Draw on]`, `[Morph]`, `[Follow path]`, `[Mask reveal]`.
   * *Tech*: `A measured path · stroke-dashoffset`.
6. **Layout**:
   * *Heading*: Same elements. A new arrangement.
   * *Description*: Keep your place as cards reorder, switch layout, or expand into a detail view.
   * *Modes*: `[FLIP]`, `[View Transitions]`, `[Reorder cards]`, `[Grid / list]`.
   * *Cards*: "A sunny day", "A small bloom", "A bright idea".
7. **Skeletal rig**:
   * *Heading*: Move the bones. The artwork follows.
   * *Description*: A joint hierarchy drives the pose. Skin weights bend the arms across two connected bones.
   * *Controls*: `[Show bones]`, `Wave <---> Dance`, `0% wave · 100% dance · bones visible`.
8. **Shaders**:
   * *Heading*: Calculate the edge, pixel by pixel.
   * *Description*: A WebGL fragment shader computes the card's rounded-corner coverage.
   * *Tech*: `WebGL shader · radius 48`, superellipse coverage function.
9. **Particles**:
   * *Heading*: Make the moment worth celebrating.
   * *Description*: A burst, a tumble, a little hang time. Hundreds of small movements become one big feeling.
   * *Banner*: "✔ Nailed it. A little delight goes a long way."
   * *Styles*: `[Confetti]`, `[Star shower]`, `[Streamers]`, `Energy 65%`, `☑ Loop celebration`.
10. **Flipbook**:
    * *Heading*: Four drawings. A lot of character.
    * *Description*: A squash, a stretch, a lift, and a landing. Each pose is a separate drawing.
    * *Controls*: `Four separate drawings (1, 2, 3, 4)`, `8 drawings / sec`.
11. **Rive / Lottie**:
    * *Heading*: Author once. Bring it into the app.
    * *Description*: Rive and Lottie both embed authored motion. Their authoring workflows and interaction models differ.
    * *Rive*: author interactions with state machines and live inputs.
    * *Lottie ↗*: bring supported After Effects motion into the app as JSON.
    * *Interactive*: `[Beginner]`, `[Intermediate]`, `[Expert]`, `APP -> RIVE: Level = 2`.

---

### D. CSS Easing Playground (easings.net inspection)
* **Title**: CSS easing playground
* **Subtitle**: A place to try out various easing types/cubic bézier curves, and to create your own.
* **Selected Curve**: `ease` -> `cubic-bezier(0.25, 0.1, 0.25, 1);`
* **Browser Defaults**: `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out`
* **VS Code Presets**: `sineIn`, `sineOut`, `sineInOut`, `circIn`, `circOut`, `quadIn`, `quadOut`, `quadInOut`, `cubicIn`, `cubicOut`, `quartIn`, `quartOut`, `quartInOut`, `quintIn`, `quintOut`

---

### E. App UI & Codex / Rive Workspace
* **App Shell ("Sticker-Game" / Puzzle App)**:
  * Hero Section: "Good things come in pieces."
  * Section title: "A LITTLE OUTING", puzzle pack: "Slow Sunday"
  * In-game header: `✕ Slow Sunday · Area 1 of 4 · 12 left`
  * Characters: Boho characters (Ochre, Clay/Terracotta, Blue)
* **Codex Desktop Interface**:
  * Window: `ChatGPT` / Codex Desktop (`GPT-5 Astra Extra High` with `Full access`)
  * Workspace: `Sticker-Game` (Branch: `Local`, `main`)
  * Prompt query: "What should we build in Sticker-Game?"
  * Actions: `Explore and understand code`, `Build a new feature, app, or tool`, `Review code and suggest changes`, `Fix issues and failures`
  * User Prompt sent: *"Can you control Rive with computer use and add a new animation to our boho characters? Let's do one where they're putting on a hat."*
* **Rive App Interface (BETA 0.8.5804)**:
  * Document: `PushToProd - Rive Quick T...`
  * Hierarchy: `[Hat Time]`, `82`, `Ochre sway anchor`, `Clay sway anchor`, `Blue sway anchor`
  * Data Models: `BohoCafeV1 ViewModel`, `BohoCharacterV1 ViewModel`, `BohoControlsV2 ViewModel`, `BohoActionV1`
  * Assets: `ochre activity props v2`, `clay activity props v2`, `blue activity props v2`, `blue-activity-props-v2`, `cafe-ochre-props`
  * Animations: `Scene Default`, `Gentle sway`
  * Palette Hex Tokens: `#F4DFAB`, `#D97848`, `#E9C779`, `#83B2FF`, `#C89B48`

---

## 2. Complete Verbatim Transcript by Chapter

### Chapter 1: When your app feels lifeless (00:00 - 01:58)
**[00:00]** Whoa. Hello there. So, is your vibecoded app kind of feeling lifeless? Do you think you're missing something that's just preventing it from becoming a top tier, the most downloaded app, the most beautiful app, the best designed app?

**[00:14]** Chances are, if you feel this way, it probably is because a lot of vibe coded apps kind of all meet to a medium. Probably won't have that human taste that you kind of expect with top tier apps. In my opinion, I think there's a few things that really make a difference when it comes to building like mobile apps or websites or any client-facing apps. And one of those things is animations. And this video is everything to do with animations.

**[00:41]** So, first we're going to talk about why animations are so important and so critical to making your app feel alive and like have taste. And then we're going to talk about kind of the theory and many different types of animations. There's a lot of visual references in this particular tutorial and this guide. I think you should really stick around to be able to kind of understand all of these different techniques so that it'll help you steer your AI when it's coding for you.

**[01:10]** And then lastly, I'll give you some tips how to use Codex and computer use—some interesting work that you previously couldn't have done or even imagined to do. So, if you're new to this channel, my name is John. I'm a senior staff software engineer at Meta and I've worked on a ton of top tier client-facing apps such as Instagram, you know I worked on Reels, Messenger, Meta AI, and currently I work on Threads.

**[01:34]** And I built a ton of animations, a bunch before AI, and it was actually really painful and hard to do. On Reels, I actually built like the pulse animation, and on Threads, I actually built the ghost post animation that like marquees. I built a whole bunch of animations all like by hand before AI. But with AI these days, it's a lot easier. And I make a ton of these videos. I cover AI news and tech news and things like that. Don't forget to subscribe. Do me a favor. Very easy to do.

---

### Chapter 2: What I built (01:58 - 03:16)
**[01:58]** I essentially have been working on a side project and I'm getting very close to finishing it. And this side project is a puzzle app essentially, and I made these little characters. The thing about when you work on a project, we call it like the last mile where you're done with like 99% of most of the work, but then there's this like polish work where you're looking at all of the functionalities and figuring out where you can bring a lot of like delight and things like that. And that's where I started working on a lot of animations.

**[02:28]** So, I'm going to show you kind of the hero section of this app. I recorded like just the hero section because I'm not ready to show off all the app. Here's this like landing experience. And as you can see, the little characters move around. They have little animations where they're drinking coffee and the background is kind of morphing into different shapes. There's some layering and parallax that's happening. It just feels very alive. It feels very tasteful.

**[02:55]** And the high-level idea here for this little animation for me is that I want to make that first landing experience perfect. I just want people to be like, "Wow, this is like really beautiful," and then kind of take a moment to just look at the animations, right? That's why it's not rushed. It's just kind of there. My app's vibe is kind of going for coziness and that's why I did it this way.

---

### Chapter 3: Taste, craft and delight (03:16 - 05:02)
**[03:17]** Let's talk a little about animations and motion in general and why it matters in software engineering and building products like software products. Number one, I think it has to do with taste. I think right now AI can do animations, but if you just say, "Hey, go make an animation," it will do something, but it will be usually kind of shitty, kind of crappy. And the reason why is because it's very hard for the AI to know what is good, what feels good. You know, that's innately a human thing. And there's no validation for what feels good.

**[03:48]** So, there's that aspect. And because a lot of apps, a lot of AI like slop apps just totally ignore all of this to just hardcore just go to the functionality and find like the most boring UIs, there is a missing element of craft. And so most AI apps, they're missing a lot of like good animation.

**[04:06]** And then the delight aspect: this is something that I learned from working at Meta. There's simple animations that really delight the users that can take your app from being just subpar to going like insanely viral. Apple also does a really good job of this. And right now the iPhone Duo just came out. And then I think rather than the flip phone itself, the one piece of thing that I heard the most about is actually the opening animation.

**[04:33]** So if you look at this, this animation, that smooth animation, and then it's just kind of seamlessly taking the same spot. It's so good. Like Samsung and all these other companies had folding phones before, but no one has done that animation. Only Apple got that right. And I'm telling you, if you're struggling to get traction on your apps, if you add just like the perfect animations to your app, it will make the world of difference. Now, there is other things like performance that I think is actually really important as well, but that's for another video.

---

### Chapter 4: The animation toolbox (05:02 - 12:32)
**[05:02]** Now that we're kind of aligned on the importance of animation, let's talk about what drives the animation. In animation, there's a lot of different software techniques to do animation. And we're going to talk about key frames first. And this is a timeline right here: 0, 1, 2 seconds, and 2.4 seconds, right? You can change the slowness of it, right? And then you could move it from timeline to timeline.

**[05:24]** What's happening here? I've selected this element and then I'm doing two key frames. I'm doing a key on the X-axis—so like is it moving horizontally?—and I'm also changing the size. So here I mark from the beginning it starts at this size and then in the middle it starts at this other size, and then it ends at this size. So you just need three key frames and then there's software frameworks that animate your movement. So that's key frames. So this is like really useful when you like want to go from shape A to shape B and you want to change different elements. You could change the color, you can change the opacity, the alpha, you can change the size, you can morph the size. So that's when you want to use key frames.

**[06:09]** Now there is something called spring animations and there's a framework around it and this is really used for like a lot of buttons and like kind of when you want to give some element some like motion and usually it's based on some like sine curve, but we could take a look. You essentially have like a point A and point B for spring animations and then you could have like different levels of it, right? This is like a gentle one, this is a snappy one, and this is a bouncy one.

**[06:33]** And then if you want to learn a lot about spring animations or like just easing functions in general, there's this website called CSS easing. These easing terms are basically replicated in all software languages. If you look at this curve, these are the curves that I'm talking about. You can see that as it's going down, it like speeds up and ramps up and then speeds down for this back end, right? Where there's like ease-in and ease-out where it's slow to start, speeds up, and slow to end.

**[07:01]** So based on these you can change essentially how a button may feel. Like let's say you click on a button and then it starts slow, ramps up the speed of going in, and as it comes out it like slows down. So depending on what you're going for, these different easing functions can really help you out, something better than just like a linear, like a straight, no variance in the movement.

**[07:22]** All right, so that's spring. Gesture is like very easy to understand. It's really just based on where the cursor is or your finger is. So, as an example, we can have a gesture like this, right? And it could be slower and it's really based on where the hand goes, right? So, it gives a feeling of interaction and liveliness that like something could be like draggable and movable, right? And I think like the first famous example of this is actually when Steve Jobs did a fling on the first original iPhone and everyone was just—their minds were blown because they flung it, it like had this animation where it sped up first and then slowed down, and then they also did the overshooting and then bounced back. So it was like a combination of spring and gesture.

**[08:06]** The next one is based on physics. So you can have animations that's based on like real life. You can simulate a physical environment in your app and then you can just have the physics take control. So you want to do this sometimes when you want the world to feel more interactable and then you don't want to like pre-program kind of the animation's like behavior. So a lot of like video games has physics simulations, right? But you can actually use it in like apps as well. So like let's say that you wanted behavior where you drop like a ball down in your phone app or something and it will go and bounce around. But you could like lower the bounce, right, so it doesn't bounce, or you can make it a lot more bouncier like this, and also slow down the speed.

**[08:50]** So, I just like went through four, but there's like a lot more different types of animation and they're all like they have different implementations and different strategies. Physics is useful if you want like some surface to feel like based on how you're moving the phone. Maybe you have a ball and if you're like rotating the phone, you want the ball to like fall down. So, you could use the gyroscope, but also make the bounds and the elements inside of it have like collision so that they bounce around.

**[09:13]** The next technique is SVG paths. And this is like scalable vector graphic path, and essentially you draw a path and then the animation follows that path, right? So you can do a lot of like—let's say you want something to go from point A to point B in like some weird curve, then you could draw an SVG curve, hide that curve, and then have the little thing follow it, right? As an example, here's a follow path. You could do something like that. But you can do a lot more other things. For example, you can morph things. The SVG is the line outside of it and then the fill inside is just a fill, and you're changing the SVG. You're morphing it through a certain path and this gives you a really interesting effect.

**[09:59]** So you could do this as well, but you could do something similar with like a shader. The way this works is it's changing the line bounds outside, but a shader is actually changing the pixel. It's using the graphics engine to change the pixel one by one. So you can do effects like this. There are situations when you need one or the other. For example, if you don't have SVGs, you can't do this morphing without a shader. But if you have the SVG lines, which is like the vector lines, the actual path, then you can do something like this.

**[10:24]** There's also layout transitions. So, thinking about your layout and then how it goes from one layout to another is a really important form of animations as well. So, for example, reordering cards like this, right? So, this is really just changing the layout, turning into a grid. And honestly, these kind of layout transitions is one of the most common ways for apps to feel very premium very easily, and there's a lot of native support around this.

**[10:48]** So the next one is around skeleton rigging. And honestly, this one is more niche and it's really for like games and things like that, but maybe your app needs more high-fidelity characters that needs to do a lot of little things, right? You want a ragdoll experience or something like that. But for like video games and things like that, you might want to rig it and then you want to put it into your world and then program these individual parts to be controllable. And then you could even like use rigging and combine it with physics so that these people could feel like they're real. So you're already seeing that there's these different techniques that combine and compose to create new effects.

**[11:29]** So we talked about shaders. It's really just like morphing pixels. You're literally taking the graphics engine and then just changing the pixels. And in this example, we're just changing like the pixels directly here to do this like rounded corners.

**[11:44]** And then let's take a look at particles. Particles is probably one of my favorite. Confetti is like a really good example of particles. Change the energy of it. And the way you do particles is usually there's a framework, but you can like set certain points, anchor points, and then a simulation of these particles like come out. One thing is it doesn't usually collide with other elements unless you build it into a video game or something like that.

**[12:11]** All right. And then there's flip book or sprites and then there's like videos, right? As an example, a flip book is like traditional animation. You're like drawing each frame. You're having the software play through it really quickly and then you get something like this. You can make it go faster, you can make it smaller, like slower. But that's flip books or sprites or sprite kits. The final idea of animation is just making a video or a GIF of your animation.

---

### Chapter 5: Rive, Lottie and open-source examples (12:32 - 14:08)
**[12:33]** Now, the last thing I want to talk about is Rive and Lottie. So, we're going to get into this more, but this is Rive. This is just using like key frames here essentially. You can see that there's key frames. It's essentially an editor for animations, right? And Lottie is very similar. We're going to get into the reason why we use this, but this is very powerful if you want to do like some more high-fidelity animations, especially around characters or something like more fancy and something that you need a lot of visual feedback to do.

**[13:00]** But for example, in here in these examples, there's a bunch of like examples on GitHub called like awesome Rive collections. But you can see all of these like character animations you can do through this tool called Rive. And Lottie is a similar tool. And I've used Lottie before for like doing a very custom animation when I worked at Capital One. I never used Rive until this side project and I wanted to show you how I did it, which is actually a really interesting part because it was fully done agentically when I kind of talk about that as well. So that's coming up.

**[13:34]** So I know that was a ton of stuff and a lot of animations, but I actually have this like little cheat sheet that you guys could, you know, pause or I'll add it as a link in my newsletter when I post this. These are kind of when you should use one or the other, right? Like key frames, when you have a choreographed sequence; gestures; SVG paths; all these different things that I talked about. I kind of made this little cheat sheet and you could even like feed this into your AI like agent and then it could like take into these elements and you could reason about it when the AI is talking to you about it. You can like steer it.

---

### Chapter 6: Composing animations (14:08 - 17:34)
**[14:08]** But I wanted to also take a moment to kind of show you the app that I built and kind of the exact places how I'm using all of these like kind of strategies or a lot of these strategies in animations to make my app feel very delightful and like very like high polish.

**[14:24]** So my app is a puzzle app. I'm building a puzzle app. I have this gesture animation, right? Like essentially it's just gesture and it comes back if I drag drop it. Look carefully here when I place it. So when I place it, there was a particle first of all, right? Like we'll place it like another little item. There was that little particle, but if you notice when the piece landed, it like kind of like did a little little thing. Didn't just like land and plop down and snap on. It like bounced a little bit, right?

**[14:58]** And then you saw that layout change as well when I finished one section. And then right here, you see this like rounded edge? This is like a shader that I'm applying. It's not really animation. It's part of how I'm composing this scene. Let's go and finish it. Sorry, I'm quickly playing. By the way, this app might be available by the time I release this video. So, go ahead and check it out. Look at the description below.

**[15:21]** So, this is the last piece I'm going to do. Watch what happens. You see that little animation? It like came out and then a little sparkled. And then here's another little—you see the little particle effects that's happening? This is a gesture animation that kind of follows the mouse. So just on this one like puzzle playing scene, there's so much of the animation techniques that I talked about. If you just try to tell Claude Code or Codex and say, "Hey, go make animations. Just go do it." You will never get this kind of quality. It just won't feel very good. But I'm kind of telling you all the little things that we're doing here.

**[16:00]** Now again, I can't show you this part. It's on the home screen, but it has the name of my app and stuff like that. I don't want to like show you guys or tell you yet. It's coming though. So, here's the thing. So, there's native movement. So, these characters, they're moving, right? They're just like moving. They're like kind of like easing, like tilting, and they're moving. So, that's essentially just like key frames in a sense. I'm like saying, "Hey, go from here to here." And I have like little key frame animations that have it move tilt left to right.

**[16:26]** And then I'm also doing layering, right? I'm thinking about the layout. You notice this guy, this orange guy, he's behind. And then these guys that are in the front, it gives this like sense of 3D parallax, right? And then this shape is morphing. So I have a SVG mask here. And so there's an image behind it and there's a mask shape around it and it's morphing. They have a bunch of animations and they have a whole state machine. And I built that through Rive.

**[16:54]** As I mentioned, there's a sway that happens, you know, they rotate around like a base and this is all through SwiftUI. It's like just native movement animations and then it travels along a path. And here's that mask that I talked about where the drawing order and then the layering, right? The layering creates depth and then the morphing of the mask of the shape. We talked about the SVG path shape and then you could essentially do that and then you can mask out the shape.

**[17:15]** And then we'll come to the Rive animations. My characters essentially have a bunch of animations. You know, they have an expression. They can change their eyes. They have a body. They like changes in formation. They deform. And they have props. They have like puzzle pieces that they like do. And they have cups and things like that.

---

### Chapter 7: Using Codex computer use with Rive (17:34 - 21:59)
**[17:35]** So, let's talk about the last part of like how I was able to build all of this. I've never used Rive before until this. I've always used Lottie, but I was doing some research and I found this tool. And the thing is these days using Codex, you can just use computer use, right? You could just tell Codex to go and build animations using Rive. This is Rive and then this is Codex. My code name is called sticker game. [laughter] But let's just say, "Can you control Rive with computer use and add a new animation to our boho characters? Let's do one where they're putting on a hat."

**[18:13]** So you can really use natural language like this to create a scenario. Of course, I had to do a ton of work to design these characters, and that's a whole another like thing on doing graphic design and then using ChatGPT or whatever to be able to fine-tune a system design. If you're interested in that, a video on doing something like that, let me know in the comments and I'll put it on the backlog to make it work.

**[18:37]** You'll see here that Codex will use computer use. And computer use, especially on the Astra model, is incredible. It's like fantastic. I actually had to teach Codex to do some of this stuff. Essentially, I taught it to design and organize all of these parts and then put it into a good hierarchy and then just start to animate it.

**[18:59]** So, I started with like drinking coffee. I used the simple like language like, "Hey, putting on a hat," like my example. But in this case, I said, "Oh, do a coffee thing." So, it gave me something like this where it broke it into these like five key frames and then it came back to the starting point. And this is very important. So what I did when I was designing this is to have a state machine where everything has a resting state. So it always goes back to the resting state.

**[19:23]** So you do something, you drink coffee—this is a state machine—and it always goes back when you're settled. And if you do that, you have a good like starting and end point. And this is a very common technique in game making where you have state machines for your animations for your characters. So here's an example: so you drink the cup, this is how it was before, and then after you drink and then it disappears. So you always have this state where you can go from beginning to any other animations, right?

**[19:54]** So another really important thing is that the reason why you want to use tools like Rive and these other things and manually like kind of validate is because AI is very bad at catching edge cases and tests of this kind of nature. If you look here very carefully, it cuts off right here. It's probably hard to see these kind of things you need to like really look out for, right? That's why when you're reviewing animations, you want to manually see it. And this is why a lot of people skip it. They don't know what can go wrong.

**[20:23]** But if you build enough animations using all these different techniques, then you can reason about a lot of things. For example, if something feels wrong in a button being pressed, you could be like, "Oh, maybe I need to change the easing function to accelerate faster or start slower." Or in my morphing example, if the edges are a little crooked, you could be like, "Oh, that's probably something wrong with my SVG path. Let's make that smoother. Let's add more points to that vector so it has easier like smoothing as an example."

**[20:53]** But yeah, so here is the computer use. So you can see this little arrow. It's doing a bunch of stuff. This will take way too long, but you can see it moving around, right? If the tools that you're trying to use doesn't have an MCP or CLI tool, then computer tools is like great. And actually, a lot of people have been using Codex to do things with Blender. You can essentially create a full scene in Blender and bake it out. You can rig things up in Blender and then try to like export part of that into your app.

**[21:26]** So, there's so many of these different techniques and in my opinion, you need to explore and play around with these tools and understand how they work underneath the hood. And then that will help you steer and guide your AI, right? Like this little puzzle. Everything in software is just a flat image at the end of the day. It's a 2D thing. And it takes true like magic to make things feel great. Like even this, this has like a little refraction on it, right? It gives it just like this 3D element on it. It's just great. It's just like chef's kiss, right? So yeah. So it's going and adding a bunch of hats and stuff like that.

---

### Chapter 8: The cheat sheet and closing thoughts (21:59 - 22:50)
**[22:00]** So again, I'll leave you guys with this little cheat sheet and then review the different animations. There's actually a bunch of pros and cons to using these elements, right? I'll also add that in my writing in my newsletter when I post this so you guys can read it. So go and check out my newsletter to get the full like kind of written details. I couldn't get through it in all in this video. It's getting too long already.

**[22:23]** So I hope you guys enjoy this video. I'm planning to do like a really deep dive of just like basic foundational software stuff and then like kind of using Codex to build software and what I think about a lot and what you should think about. So if you're interested in that, don't forget to subscribe. I also have a whole video where I go over kind of like key features on Codex. So feel free to check that out. But yeah, I hope you guys enjoyed this video and until I see you guys on the next one. Bye.

---

## 3. Video Metadata & Referenced Resources
* **Video Title**: AI App Animations is Hard Until You Learn This
* **Channel**: Push To Prod / Jonny (@PremiumGoblin)
* **Author Background**: Senior Staff Software Engineer at Meta (worked on Instagram, Reels pulse animation, Threads marquee ghost post animation, Messenger, Meta AI).
* **Tools & Links Referenced**:
  * [Rive](https://rive.app)
  * [Awesome Rive Collections](https://github.com/rive-app/awesome-rive)
  * [Rive iOS Examples](https://github.com/rive-app/rive-ios)
  * [CSS Easing Playground](https://easings.net)
  * [Push To Prod Substack](https://getpushtoprod.substack.com)
  * [Codex App Walkthrough Video](https://www.youtube.com/watch?v=nQFtsehu7h0)
