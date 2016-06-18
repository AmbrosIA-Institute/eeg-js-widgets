
function HorseshoeWidget(width, height) {
    this.width = width;
    this.height = height;
    this.stopping = false;
    this.demoMode = true;
    this.center_x = 450;
    this.center_y = 300;
    this.outer_radius = 90;
    this.inner_radius = 60;
    this.cap_radius = (this.outer_radius - this.inner_radius) / 2;
    this.begin_angle = (8 / 12) * Math.PI;
    this.end_angle = (4 / 12) * Math.PI;
    this.renderer = PIXI.autoDetectRenderer(width, height, { antialias: false });
    this.stage = new PIXI.Container();
    this.stage.interactive = true;
    this.boundAnimate = this.animate.bind(this);
    this.setupScene();
};

HorseshoeWidget.prototype = {
    constructor: HorseshoeWidget,

    getView: function() {
        return this.renderer.view;
    },

    drawArc: function(radius, anticlockwise) {
        var graphics = new PIXI.Graphics();
        graphics.arc(this.center_x, this.center_y, radius, this.begin_angle, this.end_angle, anticlockwise);
        var point_count = graphics['currentPath']['shape']['points'].length;
        var x1 = graphics['currentPath']['shape']['points'][0];
        var y1 = graphics['currentPath']['shape']['points'][1];
        var x2 = graphics['currentPath']['shape']['points'][point_count - 2];
        var y2 = graphics['currentPath']['shape']['points'][point_count - 1];
        return [x1, y1, x2, y2];
    },

    findEndcapPoints: function() {
        var points;
        var left_in_x, left_in_y;
        var right_in_x, right_in_y;
        var left_out_x, left_out_y;
        var right_out_x, right_out_y;
        var left_cap_x, left_cap_y, right_cap_x, right_cap_y;
        // Outer Circle
        points = this.drawArc(this.outer_radius, false);
        left_out_x = points[0];
        left_out_y = points[1];
        right_out_x = points[2];
        right_out_y = points[3];
        // Inner Circle
        points = this.drawArc(this.inner_radius, false);
        left_in_x = points[0];
        left_in_y = points[1];
        right_in_x = points[2];
        right_in_y = points[3];
        // Endcap Centers
        left_cap_x = (left_in_x + left_out_x) / 2;
        left_cap_y = (left_in_y + left_out_y) / 2;
        right_cap_x = (right_in_x + right_out_x) / 2;
        right_cap_y = (right_in_y + right_out_y) / 2;
        return [left_cap_x, left_cap_y, right_cap_x, right_cap_y];
    },

    fillHorseshoeBackground: function(left_cap_x, left_cap_y, right_cap_x, right_cap_y) {
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(2, 0xffffff);
        graphics.beginFill(0xffffff);
        graphics.drawCircle(left_cap_x, left_cap_y, this.cap_radius);
        graphics.arc(this.center_x, this.center_y, this.outer_radius, this.begin_angle, this.end_angle, false);
        graphics.arc(this.center_x, this.center_y, this.inner_radius, this.end_angle, this.begin_angle, true);
        graphics.drawCircle(right_cap_x, right_cap_y, this.cap_radius);
        graphics.endFill();
        this.stage.addChild(graphics);
    },

    drawHorseshoeBackground: function() {
        var points = this.findEndcapPoints();
        this.fillHorseshoeBackground(points[0], points[1], points[2], points[3]);
    },

    drawConnectionEllipse: function(x, y, angle) {
        var graphics = new PIXI.Graphics();
        graphics.x = x;
        graphics.y = y;
        graphics.lineStyle(4, 0x0000ff);
        graphics.rotation = angle;
        graphics.beginFill(0x777777);
        graphics.drawEllipse(0, 0, 20, 12);
        graphics.endFill();
        this.stage.addChild(graphics);
    },

    drawConnectionStatus: function() {
        var radius = (this.outer_radius + this.inner_radius) / 2;
        var distance = Math.sqrt(2) * radius / 2;
        var x, y, angle;
        // Front Left
        x = this.center_x - distance;
        y = this.center_y - distance;
        angle = (9 / 12) * Math.PI;
        this.drawConnectionEllipse(x, y, angle);
        // Front Right
        x = this.center_x + distance;
        y = this.center_y - distance;
        angle = (3 / 12) * Math.PI;
        this.drawConnectionEllipse(x, y, angle);
        // Back Left 
        x = this.center_x - distance;
        y = this.center_y + distance;
        angle = (3 / 12) * Math.PI;
        this.drawConnectionEllipse(x, y, angle);
        // Back Right
        x = this.center_x + distance;
        y = this.center_y + distance;
        angle = (9 / 12) * Math.PI;
        this.drawConnectionEllipse(x, y, angle);
    },

    setupScene: function() {
        this.drawHorseshoeBackground();
        this.drawConnectionStatus();
    },

    frame: function(time) {
        this.onFrame++;
        if (this.demoMode) {
        }
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

