$(function(){
	var player;
	var music = {
		init : function(params){
			player=new Audio()
			var url = params['url'];
			var volume=params['volume'];
			music.settingPlayerUrl(url);
			player.volume=volume/100;
			music.volume=volume;
		},
		duration : 0,
		volume : 0, /*当前播放器的默认声音,用于禁音后重新设置音量做准备*/
		dragging : false,/*当前用户是否正在拖动进度条,如果在拖动则音乐播放时不进行进度条的更新,判断两种情况:1.用户拖动并未改变进度条 2.用户拖动进度条改变了当前音乐播放位置,则定位到*/
		play : function(){
			if(player==null){
				console.error('player not initialization.');
				throw new Error('music player not initialization.');
			}
			player.play();
		},
		pause : function(){
			player.pause();
		},
		backward : function(url){
			music.settingPlayerUrl(url);
		},
		forward : function(url){
			music.settingPlayerUrl(url);
		},
		muted : function(value){
			player.muted=value;
			return player.muted;
		},
		settingVolume : function(volume){
			var value=parseInt(Math.ceil(volume))/100;
			player.volume=value;
			music.volume=volume;
		},
		settingPlayerUrl : function(url){
			player.pause();
			player.src=url;
			player.load();
		},
		notifyVolumnChange : function(node){
			if(Math.floor(music.volume)<5){
				//移除音量图标,添加禁音图标
				node.removeClass('icon-volume-up icon-volume-down').addClass('icon-volume-off');
			}else if(music.volume>60){
				//移除禁音图标,添加最大音量图标
				node.removeClass('icon-volume-off icon-volume-down').addClass('icon-volume-up');
			}else{
				//移除最大音量图标和禁音图标,添加一般图标
				node.removeClass('icon-volume-off icon-volume-up').addClass('icon-volume-down');
			}
		},
		formatSeconds : function(value){
			var time=parseInt(value);
			var minute=0;
			var hours=0;
			if(time>60){
				minute=parseInt(time/60);
				time=parseInt(time%60);
			if(minute>60){
				hours=parseInt(minute/60);
				minute=parseInt(minute%60);
			}
			}
			var result=music.toDouble(parseInt(time));
			if(minute>0){
				result=music.toDouble(parseInt(minute))+":"+result;
			}else{
				result=music.toDouble(parseInt(minute))+":"+result;
			}
			if(hours>0){
				result=music.toDouble(parseInt(hours))+":"+result;
			}
			return result;	
		},
		toDouble : function(value){
			return value<10?"0"+value:value;
		},
		handlerProgressBar : function(curtime,speed){
			var blast=curtime*speed;
			var maxWidth=progress.css('width');
			if(blast>=maxWidth){
				progressBar.css({'width':maxWidth});
				progressBtn.css({'left':maxWidth});
			}else{
				progressBar.css({'width':blast});
				progressBtn.css({'left':blast});
			}
		},
		finishPlay : function(){
			//初始化操作
			curtime.text('00:00');
		 	totaltime.text('00:00');
			progressBtn.css('left',0);
			progressBar.css('width',0);
		},
		seek : function(node,curtime){
			music.pause();
			node.text(music.formatSeconds(curtime));
			clearTimeout(timer);
			var timer=setTimeout(function(){
				player.currentTime=curtime;
			},200);
		},
		playerListener : function(){
			player.addEventListener("play",function(){
				console.log('play');
			});
		},
		updateListener : function(){
			player.addEventListener("timeupdate",function(){
				var speed=parseInt(progress.css('width'))/music.duration;
				if(!music.dragging){
					music.handlerProgressBar(player.currentTime,speed);
					curtime.text(music.formatSeconds(player.currentTime));
				}
			});
		},
		endedListener : function(){
			player.addEventListener("ended",function(){
				console.log("ended");
				music.finishPlay();
			});
		},
		loadstartListener : function(){
			player.addEventListener("loadstart",function(){
				console.log("loadstart");
				music.finishPlay();
			});
		},
		progressListener : function(){
			player.addEventListener("progress",function(){
				music.duration=player.duration;
				totaltime.text(music.formatSeconds(music.duration));
				console.log("progress");
			});
		},
		pauseListener : function(){
			player.addEventListener("pause",function(){
				console.log("pause");
			});
		},
		canplaythroughListener : function(){
			player.addEventListener("canplaythrough",function(){
				console.log("canplaythrough");
			});
		},
		canplayListener : function(){
			player.addEventListener("canplay",function(){
				console.log("canplay");
			});
		}
	};
	
	//初始化播放器
	music.init({
		'url':'http://yinyueshiting.baidu.com/data2/music/134369388/4626708293600128.mp3?xcode=1f970274219ec4286a37d80a2c02fc5b',
		'volume':60,
		'list': null
	});
	//添加监听事件
	music.playerListener();
	music.updateListener();
	music.loadstartListener();
	music.progressListener();
	music.pauseListener();
	music.canplaythroughListener();
	music.canplayListener();
	music.endedListener();

	//播放器相关容器
	var curtime=$('.time-current'); 
	var totaltime=$('.time-remain');
	//播放器按钮
	var playBtn=$('.btn-play');
	var backwardBtn=$('.btn-backward');
	var forwardBtn=$('btn-forward');
	var volumnBtn=$('.btn-volumn');
	var volumnProgress=$('.volumn-progress');
	var volumeBar=$('.volumn-progress-bar');
	var volumnDot=$('.progress-volumn-circle');

	playBtn.click(function(){
		//播放状态：0未播放 1正在播放
		var status=$(this).attr('status');
		var handler=$(this).find('.play-status');
		if(status==0){
			music.play();
			$(this).attr('status','1');
			handler.removeClass('icon-play').addClass('icon-pause');
		}else{
			music.pause();
			$(this).attr('status','0');
			handler.removeClass('icon-pause').addClass('icon-play');
		}
	});

	/*禁音按钮*/
	volumnBtn.click(function(){
		// 1 正常 0 静音 
		var status=$(this).attr('status');
		var handler=$(this).find('.volumn-status');
		if(status==1){
			music.muted(true);
			$(this).attr('status','0');
			handler.removeClass('icon-volume-up icon-volume-down').addClass('icon-volume-off');
			volumnDot.stop().animate({'left':0},100);
			volumeBar.stop().animate({'width':0},100);
		}else if(music.volume>=60){
			music.muted(false);
			$(this).attr('status','1');
			handler.removeClass('icon-volume-off icon-volume-down').addClass('icon-volume-up');
		}else if(music.muted&&music.volume>0&&music.volume<60){
			$(this).attr('status','1');
			music.muted(false);
			handler.removeClass('icon-volume-off icon-volume-up').addClass('icon-volume-down');
		}
		volumnDot.css('left',music.volume);
		volumeBar.css('width',music.volume);
	});

	/*拖动音量按钮事件*/
	var volumn_statu=false;//记录鼠标拖动状态
	var volume_startX=0;//记录鼠标拖动的X坐标
	var volume_left=0;

	volumnDot.mousedown(function(e){
		console.log('mousedown');
		volume_startX=e.pageX-$(this).offset().left;
		volumn_statu=true;
		volume_left=e.pageX;

	});
	volumnDot.mouseup(function(e){
		volumn_statu=false;
	});
	volumnProgress.mousemove(function(e){
		e.preventDefault();
		var maxWidth=parseInt($(this).css('width'));
		var blast=e.pageX-$(this).offset().left;
		if(volumn_statu){
			if(blast>maxWidth){
				blast=maxWidth;
			}
			if(blast<0){
				blast=0;
			}
			volumnDot.css('left',blast-4);
			volumeBar.css('width',blast);
			music.settingVolume(blast);
			music.notifyVolumnChange(volumnBtn.find('.volumn-status'));
		}
	});
	volumnProgress.click(function(e){
		var maxWidth=parseInt(volumnProgress.css('width'));
		var left=$(this).offset().left;
		var blast=e.pageX-left;
		if(!volumn_statu){
			if(blast>maxWidth){
				blast=maxWidth;
			}
			if(blast<0){
				blast=0;
			}
		}
		volumnDot.stop().animate({'left':blast-4},100);
		volumeBar.stop().animate({'width':blast},100);
		//设置系统的音量
		music.settingVolume(blast);
		music.notifyVolumnChange(volumnBtn.find('.volumn-status'));
	});
	//鼠标滚轮调整音量大小
	volumnProgress.on('mousewheel DOMMouseScroll',function(e){
		var maxWidth=parseInt(volumnProgress.css('width'));
		e.preventDefault();
		var delta=(e.originalEvent.wheelDelta&&(e.originalEvent.wheelDelta>0?1:-1)||(e.originalEvent.detail&&(e.originalEvent.detail>0?-1:1)));
		var volume=music.volume;
		if(delta>0){
			volume=volume+10;
		}else{
			volume=volume-10;
		}
		if(volume>=maxWidth){
			volume=maxWidth;
		}
		if(volume<=0){
			volume=0;
		}
		volumnDot.stop().animate({'left':volume-4},100);
		volumeBar.stop().animate({'width':volume},100);
		//设置系统的音量
		music.settingVolume(volume);
		music.notifyVolumnChange(volumnBtn.find('.volumn-status'));
	});


	/*播放列表控件点击切换Tab面板*/
	$('.list-bar-btn a').click(function (e) {
  		e.preventDefault()
  		$(this).tab('show');
	});

	/*点击收藏按钮特效*/
	$('body').on('click','.heart',function(){
		var handler=$('.heart');
		handler.css("background-position","");
		var rel=handler.attr('rel');
		if(rel=='like'){
			handler.addClass('heart-animation').attr('rel','unlike');
		}else{
			handler.removeClass('heart-animation').attr('rel','like');
			handler.css('background-position','left');
		}
	});
	$('body').on('click','.like',function(){
		$(this).css("background-position","");
		var rel=$(this).attr('rel');
		if(rel=='like'){
			$(this).addClass('heart-animation').attr('rel','unlike');
		}else{
			$(this).removeClass('heart-animation').attr('rel','like');
			$(this).css('background-position','left');
		}
	});
	/*播放器进度条*/
	var progress=$('.player-progress');
	var progressBar=$('.player-progress-bar');
	var progressBtn=$('.progress-circle');
	var statu=false;
	var left=0;
	var ox=0;
	var lx=0;

	$(document).mouseup(function(){
		statu=false;
		volumn_statu=false;
		music.dragging=false;
		if(!music.dragging){
			music.play();//TODO
		}
	});
	progressBtn.mousedown(function(e){
		e.preventDefault();
		lx=$(this).offset().left;
		ox=e.pageX-left;
		statu=true;
		music.dragging=true;
		music.pause();
	});
	progress.mousemove(function(e){
		var maxWidth=parseInt(progress.css('width'));
		e.preventDefault();
		if(statu){
			left=e.pageX-ox;
			if(left<0){
				left=0;
			}
			if(left>maxWidth){
				left=maxWidth;
			}
			progressBtn.css('left',e.pageX);
			progressBar.stop().animate({'width':e.pageX},100);
			var t_width=(maxWidth-parseInt(progressBtn.css('left')));
			var speed=maxWidth/music.duration;
			var curWidth=(maxWidth-t_width);
			var time=(curWidth/speed);;
			music.seek(curtime,time);
		}
	});
	progress.click(function(e){
		var maxWidth=parseInt(progress.css('width'));
		music.pause();
		music.dragging=true;
		if(!statu){
			var bg_left=$(this).offset().left;
			var left=e.pageX-bg_left;
			if(left<0){
				left=0;
			}
			if(left>maxWidth){
				left=maxWidth;
			}
			progressBtn.stop().animate({'left':left},200);
			progressBar.stop().animate({'width':left},100);
			var t_width=(maxWidth-left);
			var speed=maxWidth/music.duration;
			var curWidth=(maxWidth-t_width);
			var time=(curWidth/speed);
			music.seek(curtime,time);
			music.play();
			music.dragging=false;
		}
	});
  /*$("div.lazy").lazyload({
      effect : "fadeIn"
  });*/
});