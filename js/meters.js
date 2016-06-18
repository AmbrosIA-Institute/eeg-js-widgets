
function MetersWidget(width, height) {
    this.width = width;
    this.height = height;
    this.epochLength = 8;
    this.channels = 4;
    this.blank_for_missing_data = false;
    this.meterData = {};
    this.meterSettings = {};
    this.stopping = false;
    this.demoMode = true;
    this.renderer = PIXI.autoDetectRenderer(width, height, { antialias: false});
    this.stage = new PIXI.Container();
    this.stage.interactive = true;
    this.boundAnimate = this.animate.bind(this);
    this.setupScene();
};

MetersWidget.prototype = {
    constructor: MetersWidget,

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

    drawLegend: function() {
        var meter, settings, text, x, y, style;
        x = 50;
        y = 50;
        for (meter in this.meterSettings) {
            style = {'font': '24px Arial', 'fill': 0xff1010, 'align': 'center'};
            style['fill'] = this.meterSettings[meter]['color'];
            text = new PIXI.Text(meter, style);
            text.x = x;
            text.y = y;
            this.stage.addChild(text);
            y = y + 50;
        }
    },

    addMeter: function(meter, color) {
        this.meterData[meter] = [];
        this.meterSettings[meter] = {'color': color, 'width': 2};
    },

    resetMeters: function() {
        this.meterData = {};
        this.meterSettings = {};
    },
    
    updateTime: function(time) {
        this.end_time = time;
        this.start_time = (this.end_time - (this.epochLength * 1000));
    },

    addSample: function(meter, value, time) {
        if (typeof(time) === 'undefined') {
            time = window.performance.now();
        }
        this.updateTime(time);
        var sample = {'value': value, 'time': time}
        this.meterData[meter].push(sample);
    },

    initMeterDisplay: function() {
        var graphics = new PIXI.Graphics();
        this.meters = graphics;
        this.stage.addChild(graphics);
    },

    initExampleMeters: function() {
        this.addMeter('mellow', 0x0000FF);
        this.addMeter('attention', 0x00FF00);
    },

    updateMeterExampleData: function() {
        var time = window.performance.now() / 1000;
        var val1, val2;
        val1 = (Math.sin(time / 3) + 1) / 2;
        val2 = (Math.cos(time / 1) + 1) / 2;
        this.addSample('mellow', val1);
        this.addSample('attention', val2);
    },

    /** Remove old samples. First sample should be only one with timestamp before beginning of the display  */
    trimMeterData: function() {
        var i, meter, data, sample, prior_count;
        for (meter in this.meterData) {
            data = this.meterData[meter];
            prior_count = 0;
            for (i = 0; i < data.length; i++) {
                sample = data[i];
                if (sample['time'] < this.start_time) {
                    prior_count++;
                }
            }
            if (prior_count > 1) {
                for (i = 1; i < prior_count; i++) {
                    this.meterData[meter].shift();
                }
            }
        }
    },

    sampleXPosition: function(sample) {
        var rel_time;
        if (sample['time'] < this.start_time) {
            return 0;
        }
        if (sample['time'] > this.end_time) {
            return this.width;
        }
        rel_time = (sample['time'] - this.start_time) / (this.end_time - this.start_time);
        return (rel_time * this.width);
    },

    sampleYPosition: function(sample) {
        var value = sample.value;
        if (value < 0) {
            value = 0;
        }
        if (value > 1) {
            value = 1;
        }
        return (this.height * (1 - value));
    },

    drawMeters: function() {
        var i, x, y, last_x;
        var meter, data, settings, sample;
        var start_index = 0;
        if (this.blank_for_missing_data) {
            start_index = 1;
        }
        var min_discontinuity_pixels = 5;
        var graphics = this.meters;
        end_time = window.performance.now();
        this.trimMeterData();
        graphics.clear();
        for (meter in this.meterData) {
            data = this.meterData[meter];
            settings = this.meterSettings[meter];
            if (data.length > start_index) {
                x = this.sampleXPosition(data[start_index]);
                y = this.sampleYPosition(data[start_index]);
                last_x = x;
                graphics.moveTo(x, y);
                graphics.lineStyle(settings['width'], settings['color'], 1);
                for (i = 1; i < data.length; i++) {
                    sample = data[i];
                    x = this.sampleXPosition(sample);
                    y = this.sampleYPosition(sample);
                    if (this.blank_for_missing_data && x - last_x >= min_discontinuity_pixels) {
                        graphics.moveTo(x, y);
                    }
                    else {
                        graphics.lineTo(x, y);
                    }
                    last_x = x;
                }
                graphics.lineTo(this.width, y);
            }
        }
    },

    setupScene: function() {
        this.onFrame = 0;
        this.drawGrid();
        if (this.demoMode) {
            this.initExampleMeters();
        }
        this.drawLegend();
        this.initMeterDisplay();
    },

    frame: function(time) {
        if (this.demoMode) {
            this.updateMeterExampleData();
        }
        this.drawMeters();
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

