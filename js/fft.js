
function FFTWidget(width, height) {
    this.width = width;
    this.height = height;
    this.samplesPerSecond = 10;
    this.maxFrequencyBin = 256;
    this.rescaleFactor = 0.2;
    this.channels = 4;
    this.barEdgeWidth = 1;
    this.barEdgeColor = 0x0000FF;
    this.barFillColor = 0x00FF00;
    this.stopping = false;
    this.demoMode = true;
    this.renderer = PIXI.autoDetectRenderer(width, height, { antialias: false });
    this.stage = new PIXI.Container();
    this.stage.interactive = true;
    this.boundAnimate = this.animate.bind(this);
    this.setupScene();
};

FFTWidget.prototype = {
    constructor: FFTWidget,

    getView: function() {
        return this.renderer.view;
    },

    initChannelData: function() {
        var i, channel;
        this.channelData = [];
        for (channel = 0; channel < this.channels; channel++) {
            this.channelData.push([]);
            for (i = 0; i <= this.maxFrequencyBin; i++) {
                this.channelData[channel].push(0);
            }
        }
    },

    setChannelData: function(data) {
        this.channelData = data;
    },

    updateSampleData: function() {
        var i, channel;
        var jitter, value;
        var jitter_factor = 10;
        var scale_wave = 40;
        var widen_wave = 5;
        var offset = Math.PI / 2;
        for (i = 0; i<= this.maxFrequencyBin; i++) {
            for (channel = 0; channel < this.channels; channel++) {
                jitter = (jitter_factor * (channel + 2) * Math.random());
                value = (Math.sin((i / widen_wave) + (channel * offset)) * scale_wave) + scale_wave + jitter + jitter_factor;
                //value = Math.min(value, 1.0);
                this.channelData[channel][i] = value;
            }
        }
    },

    initChartDisplay: function() {
        var graphics = new PIXI.Graphics();
        this.charts = graphics;
        this.stage.addChild(graphics);
    },

    drawCharts: function() {
        var i, channel, top, bottom;
        var graphics = this.charts;
        var channelHeight = this.height / this.channels;
        var barWidth =  this.width / (this.maxFrequencyBin + 1);
        var barTop, barLeft, barheight;
        graphics.clear();
        graphics.lineStyle(this.barEdgeWidth, this.barEdgeColor, 1);
        for (channel = 0; channel < this.channels; channel++) {
            top = Math.round(channelHeight * channel);
            bottom = top + channelHeight;
            for (i = 0; i<= this.maxFrequencyBin; i++) {
                barLeft = i * barWidth;
                barHeight = this.channelData[channel][i] * this.rescaleFactor;
                barHeight = Math.min(barHeight, channelHeight);
                barTop = bottom - barHeight;
                graphics.beginFill(this.barFillColor, 1);
                graphics.drawRect(barLeft, barTop, barWidth, barHeight);
                graphics.endFill();
            }
        }
    },

    setupScene: function() {
        this.initChannelData();
        this.initChartDisplay();
        if (this.demoMode) {
            this.updateSampleData();
        }
    },

    frame: function(time) {
        if (this.demoMode) {
            this.updateSampleData();
        }
        this.drawCharts();
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

