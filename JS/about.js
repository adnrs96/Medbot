$('.chat').click(function() {
  $('.body').remove();
  $("body").css("display", "flex");
    $("body").css("padding", "50px");
      $("body").css("box-sizing", "border-box");
        $("body").css("background", "radial-gradient(#1f3a47, #0b1114)");

   $('<div class="spinner"></div>').appendTo("body");
     setTimeout(function() {
     	window.location = 'about.html';
     },4000);

});

$('.dev').click(function() {
  $('.body').remove();
  $("body").css("display", "flex");
    $("body").css("padding", "50px");
      $("body").css("box-sizing", "border-box");
        $("body").css("background", "radial-gradient(#1f3a47, #0b1114)");

   $('<div class="spinner"></div>').appendTo("body");
     setTimeout(function() {
     	window.location = 'developers.html';
     },4000);

});
