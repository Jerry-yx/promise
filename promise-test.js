/**********************1***************************/
/*promise 1 红灯三秒亮一次，绿灯一秒亮一次，黄灯2秒亮一次;如何让三个灯不断交替重复亮灯？（用Promse实现）三个亮灯函数已经存在：
引申，增加请求次数。
*/

var red = function(){
	console.log('red');
}
var yellow = function(){
	console.log('yellow');
}
var green = function(){
	console.log('green');
}

var timmerPromise = function(length,light,timmer){
	return new Promise(function(resolve,reject){
		setTimeout(function(){
			light();
			length = length+1;
			console.log(length);
			resolve(length);
		},timmer)
	})
}
var setter =function(length){//length表示异步请求的次数
	Promise.resolve(length).then(function(length){
				return timmerPromise(length,red,3000)
			}).then(function(length){
				return timmerPromise(length,yellow,2000)
			}).then(function(length){
				return timmerPromise(length,green,1000)
			}).then(function(length){
				if(length<100){
					setter(length)
				}
			});
}
/*执行时放开*/
//setter(0);


/**********************2***************************/
/*实现 mergePromise 函数，把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组 data 中。
// 要求分别输出
// 1
// 2
// 3
// done
// [1, 2, 3]*/

const timeout = function(ms,x){
	return new Promise(function(resolve, reject){
			    setTimeout(function(){
	    			resolve(x);
			    }, ms);
			});
};

const ajax1 = function() { 
	return timeout(2000,1).then(function(x){
		console.log(x);
		return x;
	});
};

const ajax2 = function() { 
	return timeout(1000,2).then(function(x){
		console.log(x);
		return x;
	});;
};

const ajax3 = function() { 
	return timeout(2000,3).then(function(x){
		console.log(x);
		return x;
	});;
};

const mergePromise = function(ajaxArray){
	// 保存数组中的函数执行后的结果
	var data = [];

	// Promise.resolve方法调用时不带参数，直接返回一个resolved状态的 Promise 对象。
	var sequence = Promise.resolve();

	ajaxArray.forEach(function(ajax){

		sequence = sequence.then(ajax).then(function(res){
						data.push(res);
						return data;
					})
	})
	
	return sequence;
};
/*执行时放开*/
/*mergePromise([ajax1, ajax2, ajax3]).then(function(data){
    console.log('done');
    console.log(data); // data 为 [1, 2, 3]
});*/



/**********************3***************************/
/*以下代码最后输出什么？
第一轮事件循环
先执行宏任务，主script ，new Promise立即执行，输出【3】，
执行 p 这个new Promise 操作，输出【7】，
发现 setTimeout，将回调放入下一轮任务队列（Event Queue），p 的 then，姑且叫做 then1，放入微任务队列，发现 first 的 then，叫 then2，放入微任务队列。执行console.log(4)，输出【4】，宏任务执行结束。
再执行微任务，执行 then1，输出【1】，
执行 then2，输出【2】。
到此为止，第一轮事件循环结束。开始执行第二轮。

第二轮事件循环
先执行宏任务里面的，也就是 setTimeout 的回调，输出【5】。
resolve(6) 不会生效，因为 p 这个 Promise 的状态一旦改变就不会在改变了。

先运行first函数，内部return申明promise p1同步得，所以先3，
申明第二个Promise p2 输出7，申明完之后输出4，p2 resolve(1) 输出1，p1 resolve(2) 输出2 ，settimeout 输出5 P2已经resolve状态，不输出6，
374125
*/ 
const first = function(){
	return new Promise(function(resolve, reject){
			    console.log(3);
			    let p = new Promise(function(resolve, reject){
			        console.log(7);
			        setTimeout(function(){
			            console.log(5);
			            resolve(6);
			        }, 0)
			        resolve(1);
			    });
			    resolve(2);
			    p.then(function(arg){
			        console.log(arg);
			    });

			});
}
/*执行时放开*/
/*first().then(function(arg){
    console.log(arg);
});
console.log(4);*/


/**********************4***************************/
/*有 8 个图片资源的 url，已经存储在数组 urls 中（即urls = ['http://example.com/1.jpg', ...., 'http://example.com/8.jpg']），而且已经有一个函数 function loadImg，输入一个 url 链接，返回一个 Promise，该 Promise 在图片下载完成的时候 resolve，下载失败则 reject。
但是我们要求，任意时刻，同时下载的链接数量不可以超过 3 个。
请写一段代码实现这个需求，要求尽可能快速地将所有图片下载完成。*/
var urls = ['https://www.kkkk1000.com/images/getImgData/getImgDatadata.jpg', 'https://www.kkkk1000.com/images/getImgData/gray.gif', 'https://www.kkkk1000.com/images/getImgData/Particle.gif', 'https://www.kkkk1000.com/images/getImgData/arithmetic.png', 'https://www.kkkk1000.com/images/getImgData/arithmetic2.gif', 'https://www.kkkk1000.com/images/getImgData/getImgDataError.jpg', 'https://www.kkkk1000.com/images/getImgData/arithmetic.gif', 'https://www.kkkk1000.com/images/wxQrCode2.png'];
function loadImg(url){
	return new Promise(function(resolve,reject){
		var image = new Image();
		image.onerror = reject
        image.src = url
		image.onload=function(){
			console.log('一张图片加载完成');
			resolve();
		}
	})
}
var p;
var loadArray=[]
urls.forEach(function(url,i){
	if(i<3){
		loadArray.push(loadImg(url));
	}else{
		p = Promise.race(loadArray).then(loadImg(url));
	}
})
function limitLoad(urls, handler, limit) {
    // 对数组做一个拷贝
    const sequence = [].concat(urls)
    let promises = [];

    //并发请求到最大数
    promises = sequence.splice(0, limit).map((url, index) => {
        // 这里返回的 index 是任务在 promises 的脚标，用于在 Promise.race 之后找到完成的任务脚标
        return handler(url).then(() => {
            return index
        }); 
    });

    // 利用数组的 reduce 方法来以队列的形式执行
    return sequence.reduce((last, url, currentIndex) => {
        return last.then(() => {
				            // 返回最快改变状态的 Promise
				            return Promise.race(promises)
				        }).catch(err => {
				            // 这里的 catch 不仅用来捕获 前面 then 方法抛出的错误
				            // 更重要的是防止中断整个链式调用
				            console.error(err)
				        }).then((res) => {
				            // 用新的 Promise 替换掉最快改变状态的 Promise
				            promises[res] = handler(sequence[currentIndex]).then(() => { return res });
				        })
    }, Promise.resolve()).then(() => {
        return Promise.all(promises)
    })

}
limitLoad(urls, loadImg, 3)



deviceSetUpScroll  checkMap-down deviceSetUpScroll