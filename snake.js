let Win = document.getElementById("Mycan");
	if (window.screen.width % 10 == 0 && window.screen.height % 10 == 0){
		Win.width = document.body.scrollWidth;
		Win.height = document.body.scrollHeight;
	}else {
		Win.width = document.body.scrollWidth-80;
		Win.height = document.body.scrollHeight-200;
	}
(function(){

	let World = {
		Size : {
			width : Win.width/10,
			height : Win.height/10
		},
		Food : {
			x : undefined,
			y : undefined,
			//随机生成食物,但是食物不能在蛇头和蛇身上,snake参数接收snake的数据
			generate : function (snake) {
				let head = snake.head.get(),
					part = snake.body.part;
				let map = [];
				//遍历整个World的坐标,排除蛇头和蛇身,把可用坐标放入map数组
				for (let x = 0; x < World.Size.width; x++) {
					for (let y = 0 ; y < World.Size.height ; y++) {
						if (x == head.x && y == head.y) {
							continue;
						}
						if (part.length > 0) {
							let pass = true;
							for (let i = part.length ; i-- ;) {
								if (x == part[i].x && y == part[i].y) {
									pass =  false ; 
									break;
								}
							}
							if (pass) {
								map.push([x,y])
							}
						}else {
							map.push([x,y])
						}
					}
				} 
				//将可用的坐标索引进行随机,作为食物的坐标
				let i = Math.floor(Math.random()*map.length);
				World.Food.x = map[i][0];
				World.Food.y = map[i][1];
			}
		}
	};
	//用来决定蛇头移动的方向,互取反数方便判断是否回头
	let Direction = {
		up : 1,
		right : 2,
		down : -1,
		left : -2,
	};
	//GameOver
	function gameover (length) {
        alert("Your Record : " + length)
	}
	//蛇的开始位置
	let Center = {
		x : Math.ceil(Math.random()*World.Size.width),
		y : Math.ceil(Math.random()*World.Size.height)
	}

	/*蛇*/
	function Snake () {
		let _SELF = this;
		//GameOver调用方法,传入当前蛇的长度
		function die () {
			gameover(_SELF.body.part.length);
		}

		//蛇的头部
		function Head () {
			this.x = Center.x;
			this.y = Center.y;
			this.direction = undefined;
			//用于给body.move和body.addBody,记录move之前的蛇头的坐标让蛇身跟随蛇头移动
			this.get = function () {
				return {
					x : this.x,
					y : this.y
				}
			}
			//移动
			this.move = function (direction) {
				//防止初始化时,造成snake.head.move(direction)为undefined
				if (!direction) {
					return true;
				}
				//保存蛇头移动前的坐标
				let head = this.get();
				//如果蛇头原地调头
				if (direction + this.direction == 0) {
					//即使蛇头方向错误也要继续移动(按原方向)
					direction = this.direction
				}
				this.direction = direction;
				//移动的方法
				switch (direction) {
					case Direction.up:
                        this.y--;
                        break;
                    case Direction.right:
                        this.x++;
                        break;
                    case Direction.down:
                        this.y++;
                        break;
                    case Direction.left:
                        this.x--;
				}
				//调用判断当蛇头吃到食物时
				if (eat(this.x,this.y)) {
					//蛇身拿到移动前的坐标并跟随蛇头移动,增加长度
					_SELF.body.addBody(head);
					//重新生成新的食物
					World.Food.generate(_SELF);
				}else if (hitCheck(this.x,this.y) || eatSelf(this.x,this.y)) { //调用判断当蛇头撞墙或者咬到蛇身时
					die();
					return false;
				}else {
					//否则蛇继续移动
					_SELF.body.move(head)
				}
				//防止键盘控制过后,snake.head.move(direction)为undefined不进入方法
				return true;
			};

			/*下面这三个方法需要判断是否碰到食物，撞到墙壁，蛇头咬到蛇身*/

			//吃东西
			function eat (x,y) {
				//判断是否与食物重合
				if (x == World.Food.x && y == World.Food.y ) {
					return true;
				}else{
					return false;
				}
			};
			//撞墙
			function hitCheck (x,y) {
				//判断是否撞墙
				if (x < 0 || x == World.Size.width || y < 0 || y == World.Size.height ) {
					return true;
				}else{
					return false;
				}
			};
			//咬到自己
			function eatSelf (x,y) {
				//判断蛇头是否碰到蛇尾
				//拿到part数组中存放的body数据
				let part = _SELF.body.part;
				for (let i = 0 ; i < part.length; i++) {
					//part中存放的是身体中X,Y坐标,如果蛇头碰到即咬到蛇尾
					if( x == part[i].x && y == part[i].y){
						return true;
					}
				}
				return false;
			}
		}


		//蛇的身体
		function Body () {
			//储存蛇身的坐标
			this.part = [];
			//蛇身的移动
			this.move = function (head) {
				if (this.part.length > 0) {
					this.part.pop();
					this.addBody(head);
				}
			}
			//蛇身增加
			this.addBody = function (head) {
				//将head参数添加到数组的第一个元素,
				//因为增长蛇身时蛇头依然在移动,那么这个时候蛇头移动前的位置
				//就是空的,将这个坐标添加到蛇身的数组中就增长了蛇身
				this.part.unshift(head)
			}
		}
		//实例化
		this.body = new Body();
		this.head = new Head();
	}

	/*初始化*/
	function init () {
		//实例化蛇
		var snake = new Snake();
		World.Food.generate(snake);
		let cxt = Win.getContext("2d");

		function draw (snake) {
			cxt.clearRect(0,0,World.Size.width*10,World.Size.height*10);
			//给蛇添加颜色
			let head = snake.head;
			cxt.fillStyle = 'black';
			//大小为10*10
			cxt.fillRect(head.x*10,head.y*10,10,10);
			let body = snake.body.part;
			//遍历蛇身长度然后添加颜色
			
			for (var i = body.length ; i-- ;) {
				cxt.fillStyle = 'green';
				cxt.fillRect(body[i].x*10,body[i].y*10,10,10);
			}
			//食物颜色
			cxt.fillStyle = 'red';
			cxt.fillRect(World.Food.x*10,World.Food.y*10,10,10);
		}

		var direction;
		//监听键盘事件
		document.addEventListener('keydown',function (e) {
			switch (e.keyCode) {
				case 37 :
					direction = Direction.left;
					break;
				case 38 :
					direction = Direction.up;
					break;
				case 39 :
					direction = Direction.right;
					break;
				case 40 :
					direction = Direction.down;
					break;
			}
		});
		//循环调用
		(function () {
			//执行move方法并重绘
			if (snake.head.move(direction)) {
				draw(snake);
				setTimeout(arguments.callee,150-snake.body.part.length)
			}
		})();
	}
	init();
})();