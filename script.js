//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]GLOBAL VARIABLES                          [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
var joined;
var sessionId;
var sessionObj;
var video = document.getElementsByTagName("video")[0];

$(function(){
  console.log('POPCORN SYNC LOADED');
  var socket = io.connect('https://localhost:3000');

  var youtubeMenu = '<div class="youtubeContainerPop"><div class="closeBtn">X</div><div class="buttonContainerPop"><button class="menuBtn menuBtnActive csPop">Create Sync</button><button class="menuBtn jsPop">Join Sync</button></div><div class="contentContainerPop"><div class="createSyncContentPop"><p>To create a sync session click the button below and wait for instructions.</p><button class="menuBtn startSync">Start</button></div><div class="joinSyncContentPop"><p>Input the session id you were given below:</p><input type="text" class="joinIdText"/><br><button class="menuBtn joinSessionBtn">Join</button></div></div></div>';

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]SHOW HIDE MENU                  [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $(document).on('keydown', function(e){
    if(e.which === 80 && e.ctrlKey){
      e.preventDefault();
      console.log('You pressed CTRL+P');
      if(window.location.href.indexOf('youtube') >= 0){
        if(video.play){video.pause()}
        if($('.youtubeContainerPop').length == 0){
          $('body').append(youtubeMenu);
          $('.joinSyncContentPop').hide();
        }else if($('.youtubeContainerPop').is(':visible')){
          $('.youtubeContainerPop').hide();
        }else{
          $('.youtubeContainerPop').show();
        }
      }
    }
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]MENU BUTTONS CLICK              [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.closeBtn', function(){
    $('.youtubeContainerPop').hide();
  });

  $('body').on('click', '.csPop', function(){
    if(!$(this).hasClass('menuBtnActive')){
      $(this).addClass('menuBtnActive');
      $('.jsPop').removeClass('menuBtnActive');
      $('.joinSyncContentPop').hide();
      $('.createSyncContentPop').show();
    }
  });

  $('body').on('click', '.jsPop', function(){
    if(!$(this).hasClass('menuBtnActive')){
      $(this).addClass('menuBtnActive');
      $('.csPop').removeClass('menuBtnActive');
      $('.joinSyncContentPop').show();
      $('.createSyncContentPop').hide();
      $('.joinIdText').focus();
    }
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]START SYNC                      [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.startSync', function(){
    $('#player-api').css('pointer-events', 'none');
    sessionObj = {videoTime: video.currentTime, sessionId: sessionId};
    joined = false;
    socket.emit('start sync', sessionObj);
  });

  //After clicking start sync
  socket.on('session id', function(obj){
    sessionObj = obj;

    //may want to instead of deleted the previous html append this from the beginning for remaking sessions, the only thing that would have to update is the input session id variable
    $('.createSyncContentPop').html('<p>Send your friend the session id below:</p><input type="text" value="'+sessionObj.sessionId+'" class="sessionIdTxt"/><br><button class="menuBtn copyToClip">Copy Session Id</button>');
  });

  //select the input that holds the session id
  $('body').on('click', '.sessionIdTxt', function(){
    $(this).select();
  });

  //copy to clip board of session id
  $('body').on('click', '.copyToClip', function(){
    $('.sessionIdTxt').select();
    document.execCommand('copy');
    $(this).text('Copied');
    $(this).css('opacity', '0.5');
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]JOIN SYNC                       [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.joinSessionBtn', function(){
    video.pause();
    joined = true;
    var sessionToJoin = $('.joinIdText').val();
    socket.emit('join sync', sessionToJoin);
    $('#player-api').css('pointer-events', 'none');
  });

  //get joined user ready for the initial play, and alert they are synced
  socket.on('init information', function(data){
    sessionObj = data;
    video.currentTime = sessionObj.videoTime;
    socket.emit('synced', sessionObj.sessionId);
  });

  //when users are both synced
  socket.on('synced', function(){
    console.log('synced');
    if(joined == false){
      $('#player-api').css('pointer-events', 'all');
    }
    $('.buttonContainerPop, .contentContainerPop').hide();
    $('.youtubeContainerPop').append('<div class="connected"></div>');
    $('.connected').text('You are now synced!');

    initControls();
  });

  //need to make a ui error, and a way to fix the error
  socket.on('sync error', function(){
    console.log('Sync ERROR');
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]CONTROLS                        [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  function initControls(){
    //hide youtube play pause
    $('.ytp-play-button').hide();

    $('.ytp-left-controls').prepend('<button class="popcornPlayBtn ytp-button" aria-label="Play"><svg xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><defs><path d="M11,10 L18,13.74 18,22.28 11,26 Z M18,13.74 L26,18 26,18 18,22.28 Z" id="ytp-svg-31"></path></defs><use class="ytp-svg-shadow" xlink:href="#ytp-svg-31"></use><use class="ytp-svg-fill" xlink:href="#ytp-svg-31"></use></svg></button><button class="popcornPauseBtn ytp-button" aria-label="Pause"><svg xmlns:xlink="http://www.w3.org/1999/xlink" height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xlink:href="#ytp-svg-transition-12"></use><path class="ytp-svg-fill" d="M 11,26 15.33,26 15.33,10 11,10 z M 19.66,26 24,26 24,10 19.66,10 z" id="ytp-svg-transition-12"></path></svg></button>');

    video.playing ? $('.popcornPlayBtn').hide(); : $('.popcornPauseBtn').hide();

    $('body').on('click', '.popcornPlayBtn', function(){
      sessionObj.videoTime = video.currentTime;
      socket.emit('play yt', sessionObj);
    });

    $('body').on('click', '.popcornPauseBtn', function(){
      sessionObj.videoTime = video.currentTime;
      socket.emit('pause yt', sessionObj);
    });
  }

  socket.on('play yt', function(sessionObj){
    $('.popcornPlayBtn').hide();
    $('.popcornPauseBtn').show();
    video.currentTime = sessionObj.videoTime;
    video.play();
  });

  socket.on('pause yt', function(sessionObj){
    $('.popcornPauseBtn').hide();
    $('.popcornPlayBtn').show();
    video.currentTime = sessionObj.videoTime;
    video.pause();
  });
});
