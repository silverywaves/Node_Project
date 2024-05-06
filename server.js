// 설치한 express 라이브러리 불러오기
const express = require('express');
const app = express();

// html에 디자인을 넣을때 css 파일 이용 -> css파일 있는 폴더를 server.js에 등록
// -> 폴더를 server.js에 등록해두면 폴더아느이 파일들 html에서 사용가능 -> html 파일에 링크 걸기
app.use(express.static(__dirname + '/public'));

// ejs 템플릿 엔진
app.set('view engine', 'ejs');
// html 파일에 데이터 넣고싶으면 .ejs 파일로 만들면 가능 -> ejs 파일은 views 폴더 안에 보관
// html 파일안에 ejs 문법 사용해 서버데이터를 집어넣을 수 있다고 생각하면 됨
// 서버 데이터를 ejs 파일 안에 넣으려면 ejs 파일로 데이터 전송, ejs 파일 안에서 <%=서버가 보낸 데이터이름%>

// 유저가 데이터를 보내면 그걸 꺼내쓰는 코드가 어려움 -> 요청.body로 쉽게 꺼내쓸 수 있게 도와주는 코드
app.use(express.json());
app.use(express.urlencoded({ extends: true }));

// mongodb 라이브러리 셋팅(호스팅받은 mongodb에 접속하고 접속결과를 db라는 변수에 저장)
const { MongoClient } = require('mongodb');

let db;
const url =
	'mongodb+srv://admin:qwer1234@cluster0.d9vvbdp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
new MongoClient(url)
	.connect()
	.then((client) => {
		console.log('DB연결성공');
		db = client.db('forum');

		// 8088 포트에 서버 띄우기(port 하나를 오픈하는 문법)
		app.listen(8088, () => {
			console.log('http://localhost:8088 에서 서버 실행중');
		});
	})
	.catch((err) => {
		console.log(err);
	});

// ------------------------------------------

// 누군가 해당 사이트 메인페이지에 접속하면
// app.get('/', (요청, 응답)=>{
//     응답.send('반갑다')     // '반갑다'라는 글자 출력
// })

// ------------------------------------------
// app.get('/URL', (요청, 응답)=>{      // 누가 /URL 로 접속하면 app.get() 함수 실행
//     응답.send('데이터~')             // 그다음 콜백함수 실행되며 데이터 보내줌
// })
// ------------------------------------------

app.get('/news', (요청, 응답) => {
	db.collection('post').insertOne({ title: '블라블라' }); // db에 데이터 저장하는 코드
	응답.send('오늘 비옴');
});

app.get('/shop', function (요청, 응답) {
	// 콜백함수(다른 함수 파라미터에 들어가는 함수)-사용불가인 곳도 있음
	응답.send('쇼핑페이지입니다~'); // 웹페이지를 보내주고 싶은 경우, html 파일 보내면 됨 => .sendFile('파일경로')
});

// // -> 유저에게 html 파일 보내주려면 sendFile()
app.get('/', (요청, 응답) => {
	응답.sendFile(__dirname + '/index.html'); // <- __dirname : server.js 파일의 절대경로
});

// await db.collection('컬렉션명').find().toArray()     // DB에 있던 데이터를 꺼냄(컬렉션에 있는 모든 document 출력)

app.get('/list', async (요청, 응답) => {
	// await 쓰려면 async 를 콜백함수 왼쪽에 붙여야 함
	// array, object 자료형 <= 여러가지 자료를 한 변수에 저장
	let result = await db.collection('post').find().toArray();
	// result : db에서 뽑은 글목록
	console.log(result[0]); // 서버에서 console.log 쓰면 터미널에 출력
	// 응답.send(result[0].title)              // 응답은 하나만 가능!
	응답.render('list.ejs', { 글목록: result });
});
/**
 *  await
 *      - 다음 줄 실행하기 전 잠깐 기다리라는 뜻
 *      - JS에서 처리가 오래걸리는 함수들은 가끔 처리가 완료되기까지 기다리지 않고 바로 다음줄을 급하게
 *      - 실행하려고 함(비동기처리)
 *      - 그것을 방지하려면 콜백함수를 쓰거나, await 를 쓰거나, .then 을 써야함
 */

app.get('/time', async (요청, 응답) => {
	응답.render('time.ejs', { date: new Date() });
});

// 글 작성 기능
// 1. 글작성페이지에서 글써서 서버로 전송
// 2. 서버는 글을 검사
// 3. 이상없으면 DB에 저장
app.get('/write', (요청, 응답) => {
	응답.render('write.ejs');
});

app.post('/add', async (요청, 응답) => {
	console.log(요청.body);
	// 제목이 비어있으면 DB저장X <- 유저 글 검사하려면 if/else
	// if(제목이 빈칸이면){DB 저장하지 말고 경고문 띄우자}
	try {
		if (요청.body.title == '') {
			응답.send('제목을 입력하세요');
		} else {
			await db
				.collection('post')
				.insertOne({
					title: 요청.body.title,
					content: 요청.body.content,
				});
			응답.redirect('/list');
		}
	} catch (e) {
		console.log(e); // 에러메시지 출력
		응답.status(500).send('서버에러');
	}
});
