
var container;
var container_width;
var container_height;
var meterswidget;
var fftwidget;
var waveformwidget;
var horseshoewidget;


function show_fft() {
    fftwidget = new FFTWidget(container_width, container_height);
    container.html(fftwidget.getView());
    waveformwidget.stop();
    meterswidget.stop();
    fftwidget.animate();
}


function show_meters() {
    meterswidget = new MetersWidget(container_width, container_height);
    container.html(meterswidget.getView());
    waveformwidget.stop();
    fftwidget.stop();
    meterswidget.animate();
}


function show_waveform() {
    waveformwidget = new WaveformWidget(container_width, container_height);
    container.html(waveformwidget.getView());
    fftwidget.stop();
    meterswidget.stop();
    waveformwidget.animate();
}


function show_horseshoe() {
    horseshoewidget = new HorseshoeWidget(container_width, container_height);
    container.html(horseshoewidget.getView());
    fftwidget.stop();
    meterswidget.stop();
    waveformwidget.stop();
    horseshoewidget.animate();
}


function init_widgets() {
    container = $('#display_area').first();
    container_width = container.width();
    container_height = container.height();
    meterswidget = new MetersWidget(container_width, container_height);
    fftwidget = new FFTWidget(container_width, container_height);
    waveformwidget = new WaveformWidget(container_width, container_height);
    horseshoewidget = new HorseshoeWidget(container_width, container_height);
}


$(document).ready(function() {
    $('#show_fft').click(show_fft);
    $('#show_meters').click(show_meters);
    $('#show_waveform').click(show_waveform);
    $('#show_horseshoe').click(show_horseshoe);
    init_widgets();
    show_waveform();
});

