var $messages = $('.messages-content'),
    d, h, m,
    i = 0;

$(window).load(function() {
  $messages.mCustomScrollbar();
  startnewfunc();
  setTimeout(function() {
    fakeMessage('Hi there, I\'m MedBot your own virtual healthcare assistant.');
  }, 100);
});


function updateScrollbar() {
  $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  });
}

function setDate(){
  d = new Date()
  if (m != d.getMinutes()) {
    m = d.getMinutes();
    $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
  }
}

function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }
  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
  setDate();
  $('.message-input').val(null);
  updateScrollbar();
  $.ajax({
          url: "http://"+window.location.host+"/query",
        dataType: 'json',
        method: "POST",
        data: { key:msg }
        })
        .done(function(Data) {
        fakeMessage(Data.key);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          alert(textStatus);
        });

}

$('.message-submit').click(function() {
  insertMessage();
});
$('.message-submit2').click(function() {
  /*$('.messages').empty();
  $('.messages').append('<div class="messages-content"></div>');
   $messages.mCustomScrollbar();
 setTimeout(function() {
    fakeMessage('Hi there, I\'m MedBot you own virtual healthcare assistant');
  }, 100);*/
 location.reload();
 startnewfunc();
});
$(window).on('keydown', function(e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }

})


function fakeMessage(msg) {
  if ($('.message-input').val() != '') {
    return false;
  }
  $('<div class="message loading new"><figure class="avatar"><img src="WhatsApp Image 2016-09-13 at 4.07.26 PM.jpeg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
  updateScrollbar();

  setTimeout(function() {
    $('.message.loading').remove();
    $('<div class="message new"><figure class="avatar"><img src="WhatsApp Image 2016-09-13 at 4.07.26 PM.jpeg" /></figure>' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    updateScrollbar();
    i++;
  }, 1000 + (Math.random() * 20) * 100);

}

function startnewfunc() {
  msg = 'startnew';
  $.ajax({
          url: "http://"+window.location.host+"/cookclearquery",
        dataType: 'json',
        method: "POST",
        data: { key:msg }
        })
        .done(function(Data) {
        console.log(Data.key);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          alert(textStatus);
        });
}
