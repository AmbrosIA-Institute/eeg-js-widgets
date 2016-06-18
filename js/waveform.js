
function WaveformWidget(width, height) {
    this.width = width;
    this.height = height;
    this.epochLength = 8;
    this.samplesPerSecond = 220;
    this.rescaleFactor = 0.5;
    this.subtractFromRaw = 700; 
    this.lastUpdatedSample = 0;
    this.totalSamples = this.epochLength * this.samplesPerSecond;
    this.positionWidth = 2;
    this.positionColor = 0x0000FF;
    this.channels = 4;
    this.waveWidth = 1;
    this.waveColor = 0xFF4488;
    this.stopping = false;
    this.demoMode = true;
    this.renderer = PIXI.autoDetectRenderer(width, height, { antialias: false });
    this.stage = new PIXI.Container();
    this.stage.interactive = true;
    this.boundAnimate = this.animate.bind(this);
    this.setupScene();
};

WaveformWidget.prototype = {
    constructor: WaveformWidget,

    getView: function() {
        return this.renderer.view;
    },

    drawGrid: function() {
        var i, j;
        var top;
        var dashLength = 4;
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(1, 0xFFFFFF, 1);
        for (i = 1; i < this.epochLength; i++) {
            for (j = 0; j < this.height / (2 * dashLength); j++) {
                top = dashLength * j * 2;
                graphics.moveTo(i * this.width / this.epochLength, top);
                graphics.lineTo(i * this.width / this.epochLength, top + dashLength);
            }
        }
        this.stage.addChild(graphics);
    },

    drawChannelNames: function() {
        var channelHeight = this.height / this.channels;
        var x = ((this.width * (this.epochLength - 1)) / this.epochLength) + 5;
        var y;
        var label;
        var style = {
                font : 'bold 24px Arial',
                fill : '#FFFFFF',
            };
        var channelnames = ["TP9", "FP1", "FP2", "TP10"];
        for (channel = 0; channel < this.channels; channel++) {
            y = channel * channelHeight;
            label = new PIXI.Text(channelnames[channel], style);
            label.x = x;
            label.y = y;
            this.stage.addChild(label);
        }
    },

    initWaveData: function() {
        var i, channel;
        this.waveData = [];
        for (channel = 0; channel < this.channels; channel++) {
            this.waveData.push([]);
            for (i = 0; i < this.totalSamples; i++) {
                this.waveData[channel].push(0);
            }
        }
        this.offset = 0;
    },

    initWaveDisplay: function() {
        var graphics = new PIXI.Graphics();
        this.wave = graphics;
        this.stage.addChild(graphics);
    },

    addChannelData: function(data) {
        var idx = this.lastUpdatedSample;
        var channel;
        var sample;
        for (var i = 0; i < data[0].length; i++) {
            idx++;
            if (idx >= this.totalSamples) {
                idx = 0;
            }
            for (channel = 0; channel < this.channels; channel++) {
                sample = data[channel][i];
                this.waveData[channel][idx] = (sample - this.subtractFromRaw) * this.rescaleFactor;
            }
            this.lastUpdatedSample = idx;
        }
    },

    updateWaveSampleData: function() {
        var start, i, jitter;
        var jitter_factor = 30;
        var scale_wave = 40;
        var widen_wave = 15;
        var channel;
        var sample;
        start = (Math.round((220 * this.onFrame) / 60) % this.totalSamples);
        stop = Math.round(start + (220 / 60));
        for (i = start; i <= stop; i++) {
            if (i == 0) {
              this.offset = this.offset + (Math.PI / 2);
            }
            for (channel = 0; channel < this.channels; channel++) {
                jitter = (jitter_factor * Math.random()) - (jitter_factor / 2.0);
                sample = (jitter + (scale_wave * Math.sin((i / widen_wave) + this.offset)));
                this.waveData[channel][i] = sample + 100;
            }
        }
        this.lastUpdatedSample = i;
    },

    initPosition: function() {
        var graphics = new PIXI.Graphics();
        this.positionBar = graphics;
        this.stage.addChild(graphics);
    },

    drawPosition: function() {
        var i = this.lastUpdatedSample;
        var graphics = this.positionBar;
        graphics.clear()
        graphics.lineStyle(this.positionWidth, this.positionColor, 1);
        graphics.moveTo(i * this.width / this.totalSamples, 0);
        graphics.lineTo(i * this.width / this.totalSamples, this.height);
    },

    drawWave: function() {
        var sample;
        var i, x, last_x, y, measure_from;
        var graphics = this.wave;
        var center, channel;
        var channelHeight = this.height / this.channels;
        graphics.clear();
        graphics.lineStyle(this.waveWidth, this.waveColor, 1);
        for (channel = 0; channel < this.channels; channel++) {
            measure_from = bottom = Math.round(channelHeight * (channel + 1));
            y = measure_from - this.waveData[channel][0];
            graphics.moveTo(0, y);
            last_x = 0;
            for (i = 1; i < this.totalSamples; i++) {
                x = Math.round((i * this.width) / this.totalSamples);
                if (x > last_x) {
                    last_x = x;
                    sample = this.waveData[channel][i];
                    if (sample > channelHeight) {
                        sample = channelHeight;
                    }
                    if (sample < 0) {
                        sample = 0;
                    }
                    y = measure_from - sample;
                    graphics.lineTo(x, y);
                }
            }
        }
    },

    setupScene: function() {
        this.onFrame = 0;
        this.drawGrid();
        this.initWaveData();
        this.initWaveDisplay();
        this.initPosition();
        this.drawWave();
        this.drawChannelNames();
    },

    frame: function(time) {
        this.onFrame++;
        if (this.demoMode) {
            this.updateWaveSampleData();
        }
        this.drawPosition();
        this.drawWave();
    },

    animate: function(time) {
        if (!this.stopping) {
            requestAnimationFrame(this.boundAnimate);
            this.frame(time);
            this.renderer.render(this.stage);
        }
        this.stopping = false;
    },

    stop: function() {
        this.stopping = true;
    }

}

