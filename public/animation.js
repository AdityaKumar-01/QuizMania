/*--------------------------------*/
/*NAVBAR ANIMATION*/
/*--------------------------------*/

$('#button-to-up').on('click', function () {
	$('.slider').css({
		left: '0%',
		transition: 'left 1s',
		'box-shadow': '10px 0px 15px black',
	});
	$('.content-up').css('visibility', 'visible');
	$('.content-in').css('visibility', 'hidden');
});
$('#button-to-in').on('click', function () {
	$('.slider').css({
		left: '50%',
		transition: 'left 1s',
		'box-shadow': '-10px 0px 15px black',
	});
	$('.content-in').css('visibility', 'visible');
	$('.content-up').css('visibility', 'hidden');
});
var c,
	currentScrollTop = 0,
	navbar = $('.nav');

$(window).scroll(function () {
	var a = $(window).scrollTop();
	var b = navbar.height();

	currentScrollTop = a;

	if (c < currentScrollTop && a > b) {
		navbar.addClass('animate__bounceOutUp');
		navbar.removeClass('animate__bounceInDown');
	} else if (c > currentScrollTop && !(a <= b)) {
		navbar.addClass('animate__bounceInDown');
		navbar.removeClass('animate__bounceOutUp');
		navbar.css('background-color', 'rgba(0, 0, 0, 0.568)');
	}
	c = currentScrollTop;
});
