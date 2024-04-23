$(document).ready(function(){

	// Handle all key press

	var keys = document.querySelectorAll(".key");

	keys.forEach((item) => {
		item.innerHTML = item.getAttribute('data-trigger');
	});

	function keyPress(e){

		var pressed = e.key;
		if(pressed == 'z'){
			$("#down").click();
			setNewNotes('down');
		} else if (pressed == 'x') {
			$("#middle").click();
			setNewNotes('middle');
		} else if (pressed == 'c') {
			$("#up").click();
			setNewNotes('up');
		} else {
			keys.forEach((item) => {
				if (item.getAttribute("data-trigger") == pressed){
					if (!item.classList.contains("active")){
						item.classList.add("active");
						openOsc(item);
					}
				}
			});
		}
	}

	document.addEventListener("keydown", keyPress);

	function keyUp(e){

		var pressed = e.key;
		keys.forEach((item) => {
			if (item.getAttribute("data-trigger") == pressed){
				item.classList.remove("active");
			}			
		});
	}

	document.addEventListener("keyup", keyUp);

	// Handle filter

	function handleFilter(e){

		$("#lowpass-display input").val(e.target.value);
	}

	document.querySelector("#lowpass-frequency").addEventListener("change", handleFilter);

	function handleFilterInput(e){

		$("#lowpass-frequency").val(e.target.value);
	}

	document.querySelector("#lowpass-frequency-input").addEventListener("change", handleFilterInput);

	// Handle filter gain

	function handleFilterGain(e){

		$("#lowpass-gain-input").val(e.target.value);
	}

	document.querySelector("#lowpass-gain").addEventListener("change", handleFilterGain);

	function handleFilterGainInput(e){

		$("#lowpass-gain").val(e.target.value);
	}

	document.querySelector("#lowpass-gain-input").addEventListener("change", handleFilterGainInput);

	// Handle volume changes

	function changeVolumeSlider(e){

		$("#volume-display input").val(e.target.value);
	}

	document.querySelector("#volume").addEventListener("change", changeVolumeSlider);

	function changeVolumeInput(e){

		$("#volume").val(e.target.value);
	}

	document.querySelector("#volume-input").addEventListener("change", changeVolumeInput);

	function changeKeyboardLetters(e){

		if($("#keyboard").is(":checked")){
			keys.forEach((item) => {
				item.innerHTML = item.getAttribute('data-trigger');
			});
		} else {
			keys.forEach((item) => {
				item.innerHTML = "";
			});
		}
	}

	document.querySelector("#keyboard").addEventListener("change",changeKeyboardLetters);

	// Handle octave change

	function setNewNotes(direction){
		var notes = [];
		if(direction == "down"){
			notes = ['130.81', '138.59', '146.83', '155.56', '164.81', '174.61', '185.00', '196.00', '207.65', '220.00', '233.08', '246.94', '261.63', '277.18', '293.66'];
		} else if (direction == "up"){
			notes = ['523.25', '554.37', '587.33', '622.25', '659.25', '698.46', '739.99', '783.99', '830.61', '880.00', '932.33', '887.77', '1046.50', '1108.73', '1174.66'];
		} else{
			notes = ['261.63', '277.18', '293.66', '311.13', '329.63' , '349.23', '369.99', '392.00', '415.30', '440.00', '466.16', '493.88', '523.25', '554.37', '587.33'];
		}
		keys.forEach(function(item, i){
			item.setAttribute("data-freq", notes[i]);
		});
	}

	function octaveChange(e){
		if(e.target){
			setNewNotes(e.target.id)
		}
	}

	octaveRadios = document.querySelectorAll(".octave-group");
	octaveRadios.forEach(item => item.addEventListener("change", octaveChange))

	// Handle decay changes

	function changeDecaySlider(e){

		$("#decay-display input").val(e.target.value);
		if(e.target.value == 10){
			$("#decay").parent().addClass("infinity-mode");
		} else if (e.target.value <= 1) {
			$("#decay").parent().addClass("kalimba-mode");
			$("#decay").parent().removeClass("infinity-mode");
		} else {
			$("#decay").parent().removeClass("infinity-mode");
			$("#decay").parent().removeClass("kalimba-mode");
		}
	}

	document.querySelector("#decay").addEventListener("change", changeDecaySlider);

	function changeDecayInput(e){

		$("#decay").val(e.target.value);
	}

	document.querySelector("#decay-input").addEventListener("change", changeDecayInput);

	// Set Context

	var audioContext = new (window.AudioContext || window.webkitAudioContext)();
	var canvas = document.getElementById("visualization");
	var canvasContext = canvas.getContext("2d");

	function openOsc(key){
		
		console.log(key);

		// create osc

		var oscillator = audioContext.createOscillator();
		oscillator.type = document.getElementById("wave").value;
		oscillator.frequency.value = key.getAttribute("data-freq");
		oscillator.start();

		// create gain

		var gain = audioContext.createGain();

		var now = audioContext.currentTime;

		// get volume controls

		var volume = $("#volume").val();		
		gain.gain.setValueAtTime((volume/2)/100, now)

		// get mute control

		var mute = $("#mute").is(":checked");
		if(mute){
			gain.gain.setValueAtTime(!mute, now);
		}

		// Create Filters 
		var lowpassFilter = audioContext.createBiquadFilter();
		var isLowpass = $("#lowpass").is(":checked");
		if (isLowpass){
			lowpassFilter.type = "lowpass";

			var lowpassFreq = $("#lowpass-frequency").val();
			lowpassFilter.frequency.setValueAtTime(lowpassFreq, now);

			var lowpassGain = $("#lowpass-gain").val();
			lowpassFilter.gain.setValueAtTime(lowpassGain, now);
		}

		// get decay time

		var decayTime = parseFloat($("#decay").val());
		// 10 is infinity mode
		if (decayTime < 10){
			gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);
		}


		function callback(mutationsList, observer) {
		    mutationsList.forEach(mutation => {
		    	if (mutation.attributeName === 'class') {
					oscillator.stop(now);
	    		};
		    })
		}

		var mutationObserver = new MutationObserver(callback);
		mutationObserver.observe(
		    document.getElementById(key.id),
		    { 
		    	attributes: true 
		    }
		)


		// VISUALIZER
		var analyser = audioContext.createAnalyser();
		var bufferLength = analyser.frequencyBinCount;
		var dataArray = new Uint8Array(bufferLength);

		// canvas
		canvasContext.clearRect(0, 0, canvas.width, canvas.height);

		function draw(){
			var drawVisual = requestAnimationFrame(draw);
			analyser.getByteTimeDomainData(dataArray);
			canvasContext.fillStyle = 'rgb(200, 200, 200)';
			canvasContext.fillRect(0, 0, canvas.width, canvas.height);
			canvasContext.lineWidth = 2;
			canvasContext.strokeStyle = 'rgb(0, 0, 0)';
			canvasContext.beginPath();
			var sliceWidth = canvas.width * 1.0 / bufferLength;
			var x = 0;

	      	for(var i = 0; i < bufferLength; i++) {

				var v = dataArray[i] / 128.0;
				var y = v * canvas.height/2;

				if(i === 0) {
					canvasContext.moveTo(x, y);
				} else {
					canvasContext.lineTo(x, y);
				}

				x += sliceWidth;
	      	}

	      	canvasContext.lineTo(canvas.width, canvas.height/2);
  			canvasContext.stroke();
		}
		draw();

		// connect oscillator to gain and connect gain to filter and filter to analyser and analyser to context
		oscillator.connect(gain);
		gain.connect(lowpassFilter);
		lowpassFilter.connect(analyser);
		analyser.connect(audioContext.destination);
	}

	canvasContext.fillStyle = 'rgb(200, 200, 200)';
	canvasContext.fillRect(0, 0, canvas.width, canvas.height);
});
