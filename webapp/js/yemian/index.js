//轮播图
$('#exampleModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget)
    var recipient = button.data('whatever')
    var modal = $(this)
    modal.find('.modal-title').text('New message to ' + recipient)
    modal.find('.modal-body input').val(recipient)
})

//引入angular
var app = angular.module('app',['ui.router']);
//自定义$http服务器
app.service('httpTool',['$http',function($http){
    this.getData = function(args,success,error){
        /*args = {
            url:,
            method:,
            params:{}
        }*/
        if(args.method == 'post'){
            //首先把params转换为data
            var data = '';
            for(var key in args.params){
            	 data += key+'='+args.params[key]+'&';
            }
           
            data = data.slice(0,-1);
//            console.log(data);
            $http({
                url:args.url,
                method:args.method,
                headers:{
                    'Content-Type':'application/x-www-form-urlencoded'
                },
                data:data,
            }).then(
                function(res){
                    success(res)
                }
            ).catch(function(err){
                error(err);
            })
        }
        else if(args.method == 'get'||args.method == 'jsonp'){
            $http({
                url:args.url,
                method:args.method,
                params:args.params,
            }).then(
                function(res){
                    success(res);
                }
            ).catch(
            		function(err){
            	error(err);
            		}
            	)
        }
    }

}])
//配置白名单
app.config(['$sceDelegateProvider',function($sceDelegateProvider){
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        //允许的路径
       'http://localhost:8080/**'
    ])
}])

//定义全局的控制器
app.controller('allController',['$scope','httpTool','$location',function($scope,httpTool,$location){
	//一开始定义flag为true,
	$scope.flag = true;
	$scope.title = '最新电影'
		$scope.$on('changeFlag',function(event){
			$scope.flag = false;
		})
		$scope.$on('changeFlag',function(event){
			$scope.flag = false;
		})
		$scope.backOne = function(){
		$scope.flag = true;
		$scope.title = '最新电影'
	};
	$scope.backTwo = function(){
		$scope.flag = true;
		$scope.title = '热门电影'
	};
	$scope.backThree = function(){
		$scope.flag = true;
		$scope.title = '经典电影'
	};
	$scope.login = true;
	$scope.user = {username:'',password:''};
	$scope.login = function(){
		httpTool.getData({
			url:'/comPorts/login.do',
			method:'post',
			params:{
				username:$scope.user.username,
				password:$scope.user.password,
			}
		},function(res){
			if(res.data !=='undefind'){
				$scope.person = res.data.user;
				$scope.login = false;
				alert('登录成功')
			}
			
		},function(err){
			alert(err);
		});
	}
	$scope.film = {key:''};
	
	$scope.searchflim = function(){
		var filmurl = '';
		console.log($scope.film.key);
		httpTool.getData({
			url:'/comPorts/searchFilmByKeyword.do',
			method:'post',
			params:{keyword:$scope.film.key}
		},function(res){
			$scope.filmData = res.data.data[0];

			if($scope.filmData.categoryId==1){
				filmurl = filmurl+'/newFilm/list';

			}else if($scope.filmData.categoryId==2){
				filmurl = filmurl+'/hotFilm/list';

			}else{
				filmurl = filmurl+'/classicalFilm/list'

			};
		
			filmurl = filmurl+'/detail/'+$scope.filmData.id;
		
			$location.path(filmurl).replace();
			
		},function(err){
			alert('找不到该电影');
		});
	}
}])


//配置路由
app.config(['$stateProvider','$urlRouterProvider',function($stateProvider,$urlRouterProvider) {
	//最新电影的模板
    $stateProvider.state('newFilm', {
        url: '/newFilm',
        templateUrl: '../../html/template/newfilm_tpl.html',
        controller: 'newController',
    }).state('newFilm.list',{
        url:'/list',
        template:'<div new-view></div>',
        controller:'newController',
        //配置子路由
    }).state('newFilm.detail',{
        url:'/list/detail/:id',
        templateUrl:'../../html/template/filmDetail.html',
        controller:'newDetailController',
    })
    
    //热门电影
    $stateProvider.state('hotFilm',{
    	url:'/hotFilm',
    	templateUrl:'../../html/template/hotFilm_tpl.html',
    	controller:'hotFilmController',
    }).state('hotFilm.list',{
    	url:'/list',
    	template:'<div hot-view><div>',
    	controller:'hotFilmController',
    }).state('hotFilm.detail',{
    	url:'/list/detail/:id',
    	templateUrl:'../../html/template/filmDetail.html',
    	controller:'newDetailController'
    })

    //经典电影
    $stateProvider.state('classicalFilm',{
    	url:'/classicalFilm',
    	templateUrl:'../../html/template/classicalFilm_tpl.html',
    	controller:'classicalFilmController',
    }).state('classicalFilm.list',{
    	url:'/list',
    	template:'<div classical-view><div>',
    	controller:'classicalFilmController',
    }).state('classicalFilm.detail',{
    	url:'/list/detail/:id',
    	templateUrl:'../../html/template/filmDetail.html',
    	controller:'newDetailController',
    })
    $urlRouterProvider.otherwise('newFilm');
}])
//自定义电影分类控制器
app.controller('newController',['$scope','httpTool','$state',function($scope,httpTool,$state){
    var url = '/comPorts/selectFilmByCategory.do';
    httpTool.getData({
            url:url,
            method:'post',
            params:{id:1},

    },function(res){
    	$scope.data = res.data;
    },function(err){
        alert(err);
    })
    //调到了子页面
   $state.go('newFilm.list');
    $scope.clickMe = function(){
    	$scope.$emit('changeFlag')};
}])
//热门电影的控制器

app.controller('hotFilmController',['$scope','httpTool','$state',function($scope,httpTool,$state){
	var url = '/comPorts/selectFilmByCategory.do' ;
	httpTool.getData({
		url:url,
		method:'post',
		params:{id:2},
	},function(res){
		$scope.data = res.data;
	},function(err){
		alert(err);
	})
	 $state.go('hotFilm.list');
	$scope.clickMe = function(){
		$scope.$emit('changeFlag');
		
	}
}])
//经典电影的控制器
app.controller('classicalFilmController',['$scope','httpTool','$state',function($scope,httpTool,$state){
	var url = '/comPorts/selectFilmByCategory.do' ;
	httpTool.getData({
		url:url,
		method:'post',
		params:{id:3},
	},function(res){
		$scope.data = res.data;
		
	},function(err){
		alert(err);
	})
	 $state.go('classicalFilm.list');
	$scope.clickMe = function(){
		$scope.$emit('changeFlag');
	}
}])
//自定义电影详情的电影控制器
app.controller('newDetailController',['$scope','httpTool','$stateParams','$state',function($scope,httpTool,$stateParams,$state){
	var url = '/comPorts/selectFilmById.do';
	var id = $stateParams.id;
	$scope.com = {comstring:'',key:''};
	httpTool.getData({
		url:url,
		method:'post',
		params:{id:id},
	},function(res){
		$scope.data = res.data;
		console.log(res);
	},function(err){
		alert(err);
	});

	//提交评论
	$scope.comSubmit = function(){
		console.log(0);
		var url = '/comPorts/filmdetailCommit.do';
		var id = $scope.data.id;
				if(!$scope.login){
					if($scope.com.comstring){
						httpTool.getData({
							url:url,
							method:'post',
							params:{
								filmId:id,
								comstring:$scope.com.comstring,
							}
						},function(res){
							
							alert('成功');
							window.location.reload();
							
						},function(err){
							alert(err)
						});
					}else{
						alert('请输入内容')
					}
				}else{
					alert('请登录');
				}
			
	}
	//删除影评
	$scope.deleteMe = function(key){
		var url = '/comPorts/filmdetailtDelete.do';
		var id = $scope.data.comments[key].id;
		httpTool.getData({
			url:url,
			method:'post',
			params:{commentId:id}
		},function(res){
			if(res.data.code==200){
				alert('删除成功')
				$scope.data.comments.slice(key,1);
				 window.location.reload();
			}else{
				alert('只能登录后删除自己的影评');
			}
		},function(err){
			alert('删除失败');
		});
	}
}])
//自定义new-view指令
app.directive('newView',function(){
    return{
        restrict:'A',
        templateUrl:'../../html/template/listViewdir_tpl.html',
        replace:true,
    }
})
//自定义hot-view指令
app.directive('hotView',function(){
	return{
		restrict:'A',
		templateUrl:'../../html/template/hotViewdir_tpl.html',
		replace:true,
	}
})
//自定义classical-view指令
app.directive('classicalView',function(){
	return{
		restrict:'A',
		templateUrl:'../../html/template/classicalViewdir_tpl.html',
		replace:true,
	}
})
