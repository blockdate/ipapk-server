var currentPlatform = null;
var appsPage = 0;

function switchPlatform(platform) {
	if (currentPlatform != platform) {
		currentPlatform = platform
		appsPage = 0;
		$('.platform_wrapper').children('li').remove();
		loadApps();
	}
}

function loadApps(){
	appsPage++;
	$.ajax({
		url:"/appstore/apps/"+currentPlatform+"/"+appsPage,
		success: function(data){
			if (data.error) {
				return;
			}
			var moreButton = $('.app_wrapper .moreAppButton');
			moreButton.hide();
			var wrapper = $('.platform_wrapper');
			$.each(data, function(index, val) {
				var item =
				'<li>'+
					'<div class="app_info">'+
						'<img src="'+val.icon+'" alt="">'+
						'<div class="info_box">'+
							'<span class="app_name">'+val.name+
							'</span><span class="version_number">'+val.version+'  '+val.build+'</span><br>'+
							'<span>更新:</span>'+
							'<span class="update_time">'+val.uploadTime+'</span>'+
							'<br><span class="changelog">'+(val.changelog ? val.changelog : "")+'</span>'+
						'</div>'+
						'<a class="down_btn" href="'+val.url+'">下载</a>'+
                    	'<a class="link_btn" href="'+val.appurl+'">ipa</a>'+
					'</div>'+
					'<ul class="all_version" bundleID="'+val.bundleID+'" nextPage="1"></ul>'+
				'</li>';
				wrapper.append(item);
			});
			if (data.length > 0) {
				moreButton.remove();
				wrapper.append(moreButton);
				moreButton.show();
			}
		}
	});
}

function loadMoreVersion(el) {
	var thisVersionInfo = null;
	if ($(el).hasClass("info_box")) {
		thisVersionInfo = $(el).parent('.app_info').siblings('.all_version');
		thisVersionInfo.toggleClass('show_version');
		if(thisVersionInfo.children().length > 1) {
			return;
		}
	} else {
		thisVersionInfo = $(el).parent('.all_version');
		$(el).remove();
	}
	var bundleID = thisVersionInfo.attr('bundleID');
	var page = thisVersionInfo.attr('nextPage');
	$.ajax({
		url:"/appstore/apps/"+currentPlatform+"/"+bundleID+"/"+page,	
		success: function(version){
			if (version.error) {
				return;
			}
			$.each(version,function(index,val){
				var versionLists = 
				'<li data="'+val.url+'" link="'+val.appurl+'" >'+
					'<img src="'+val.icon+'" alt="">'+
					'<p><span class="app_name">'+val.name+'</span><span class="version_number">'+val.version+'  '+val.build+'</span></p><p><span>更新：</span><span class="update_time">'+val.uploadTime+'</span></p><p><span class="changelog">'+(val.changelog ? val.changelog : "")+'</span></p>'+
				'</li>';
				thisVersionInfo.append(versionLists);
			});
			thisVersionInfo.attr('nextPage', parseInt(page)+1);
			if (version.length > 0) {
				var moreButton = 
				'<li id="moreButton">'+
					'<span>加载更多</span>'+
				'</li>';
				thisVersionInfo.append(moreButton);
			}
		}
	});
}

$(function(){
	$('.platform_title').on('click',function(){
		$(this).siblings().removeClass('selected_title');
		$(this).addClass('selected_title');
		switchPlatform($(this).text().toLowerCase());
	});
	//点击展开二维码
	$('.qrcode_btn').on('click',function(){ 
		$('.qrcode_box').toggleClass('qrcode_box_show');
		$(this).toggleClass('open');
	});
	//点击加载更多APP
	$('.app_wrapper .moreAppButton').on('click',function() {
		loadApps();
	});
	//点击展开版本内容
	$('.platform_wrapper').on('click','.info_box',function() {
		loadMoreVersion(this);
	});
	
	//版本选择
	$('.platform_wrapper').on('click','.all_version li',function(){ 
		if ($(this).attr("id") == 'moreButton') {
			loadMoreVersion(this);
			return;
		}

		if(!$(this).hasClass('select') ){ 
			$(this).siblings('li').removeClass('select');
			$(this).addClass('select');
			$(this).parent().siblings().children('.down_btn').attr('href',$(this).attr('data'));
			$(this).parent().siblings().children('.link_btn').attr('href',$(this).attr('link'));
			var app_infoNode = $(this).parent().siblings().children('.info_box');
			app_infoNode.find('.app_name').text($(this).find('.app_name').text())
			app_infoNode.find('.version_number').text($(this).find('.version_number').text())
			app_infoNode.find('.update_time').text($(this).find('.update_time').text())
			app_infoNode.find('.changelog').text($(this).find('.changelog').text())
		}
	});
	
	// 二维码
	new QRCode(document.getElementsByClassName('qrcode_pic')[0], {
		text: location.href,
		width: 160,
		height: 160,
		colorDark : "#000000",
		colorLight : "#ffffff",
		correctLevel : QRCode.CorrectLevel.H
	});
	switchPlatform('ios');
});