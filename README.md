spideysynth is a playable synth using the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API):

![Screenshot of the synth in a chrome browser. It's a keyboard with 15 keys and some controls above the keys.](./images/screenshot.png?raw=true "SpideySynth")

The project uses jQuery to open an oscillator whenever a key is pressed. There is also a visualization of the audio wave uses an HTML Canvas element:

![Gif demonstrating the aduio wave visualization on the synth](./images/visualize.gif)

I built this in 2020. If I were to make a spideysynth 2.0 today, I would use React for the ability to store references to audio nodes as refs, and for the ability to handle functionality of child components in a more narrow scope. I would rebuild without jQuery. This project scratches the surface of what the Web Audio API is capable of, and there is a more effective way to control oscillation than opening a new one for each note pressed. At the time, this approach allowed an easy shortcut to polyphony, but it's not the best approach.
