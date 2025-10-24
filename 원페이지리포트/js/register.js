const PROJECT_PREFIX = 'health-report-210729-';

const ele_inq_main = document.querySelector('.inquiry-main');
const ele_ind_text = document.querySelector('.indicator-text');
const ele_inq_ind = document.querySelector('.inquiry-indicator');
const ele_ind_bar = document.querySelector('.indicator-bar');
const ele_ind_bar_filled = document.querySelector('.indicator-bar-filled');
const ele_slider_age = document.querySelector('.slider-age');
const ele_slider_height = document.querySelector('.slider-height');
const ele_slider_weight = document.querySelector('.slider-weight');
let index_start = 0;
let index_current = index_start;
let page_count = 4;

// let app_data_ls = localStorage[`${PROJECT_PREFIX}app_data`];
// let app_data;
// 로딩 기능을 구현하려다가...
// // 작성 중이던 데이터를 확인함.
// if(app_data_ls !== undefined) {
// 	let app_data = JSON.parse(app_data_ls);

// 	if(app_data.register_progress !== undefined) {
		
// 	}
// } else {
// 	show_index_page(index_current, true);
// }

show_index_page(index_current, true);


window.onload = () => {
	document.body.classList.add('loaded-window');
};

function prev_slide() {
	index_current--;
	show_index_page(index_current);
}

function next_slide() {
	index_current++;
	if(index_current >= page_count) {
		show_index_page('fin');
		document.body.classList.add('congrat');

		ele_inq_ind.classList.add('hide');

		localStorage[`${PROJECT_PREFIX}height`] = ele_slider_height.value;
		localStorage[`${PROJECT_PREFIX}weight`] = ele_slider_weight.value;
		localStorage[`${PROJECT_PREFIX}age`] = ele_slider_age.value;

		localStorage[`${PROJECT_PREFIX}_basic_done`] = 1;

		setTimeout(() => {
			document.querySelector(`.inquiry-section[data-page="fin"]`).classList.add('slide-out');
			document.querySelector(`.inquiry-section[data-page="fin-next"]`).classList.add('show');
		}, 3000);
		return;
	}
	show_index_page(index_current);
}

document.querySelectorAll('.inquiry-gender-option').forEach(e => {
	e.addEventListener('click', ev => {
		// localStorage[`${PROJECT_PREFIX}gender`] = e.getAttribute('data-for') === "male" ? 0 : 1;
		// 여성 관련 리소스가 완성되지 않아서 male로 강제 할당...
		localStorage[`${PROJECT_PREFIX}gender`] = 0;
		ele_inq_main.setAttribute('data-gender', e.getAttribute('data-for'));
		next_slide();
	});
});

document.body.addEventListener('click', ev => {
	// ev.target이나 ev.target.parentElement 중 하나가 link-prev 클래스를 가질 경우 true로 evaluate됨.
	if([ev.target, ev.target.parentElement].some(e => e.classList.contains('link-prev'))) {
		ev.stopPropagation();
		prev_slide();
	}
	if([ev.target, ev.target.parentElement].some(e => e.classList.contains('link-next'))) {
		ev.stopPropagation();
		next_slide();
	}
}, true);

ele_slider_age.addEventListener('input', ev => {
	const age = parseInt(ele_slider_age.value);
	document.querySelector('.inquiry-num-input[for="age"]').innerText = age;
});

ele_slider_height.addEventListener('input', ev => {
	const height = parseInt(ele_slider_height.value);
	document.querySelector('.inquiry-num-input[for="height"]').innerText = height;

	
	// 평균 체중을 (키 - 100) * 0.9로 가정하여, 최소값은 그 0.5배, 최대값은 그 2배로 설정하지만,
	// 실질적인 데이터를 수집하여 서버에서 받아와 그 값으로 설정하는 식으로 변경 가능.
	const average = (height - 100) * 0.9;
	const min = Math.round(average * 0.66);
	const max = Math.round(average * 2);
	const adjusted = Math.round(average);
	const current_weight = parseInt(ele_slider_weight.value);
	ele_slider_weight.setAttribute('min', min);
	ele_slider_weight.setAttribute('max', max);
	// ele_slider_weight 값의 자동 adjustment 기능.
	// ele_slider_weight에서 한 번이라도 input 이벤트가 발생했다면,
	// 이 부분은 발생하지 않음.
	if(ele_slider_weight.getAttribute('modified') !== "true") {
		ele_slider_weight.value = adjusted;
	} else {
		if(current_weight < min) ele_slider_weight.value = min;
		if(current_weight > max) ele_slider_weight.value = max;
		// console.log(current_weight, min, max);
	}
	document.querySelector('.inquiry-num-input[for="weight"]').innerText = current_weight;

	document.querySelectorAll('.visual-que-person').forEach(e => {
		e.style.transform = generate_transform();
	});
});

ele_slider_weight.addEventListener('input', ev => {
	// 허용하는 체중값과 디폴트 체중값을 지정하도록 변경.
	const weight = parseInt(ele_slider_weight.value);

	ele_slider_weight.setAttribute('modified', 'true');

	document.querySelector('.inquiry-num-input[for="weight"]').innerText = weight;
	document.querySelectorAll('.visual-que-person').forEach(e => {
		// 기준값일 때 Y가 1. height와 달리, 입력된 키에 따라 기준값이 달라짐.
		// 산출 수식은 체질량지수가 20일 때 1이고, 매 1마다 0.02가 증가함.
		e.style.transform = generate_transform();
	});
});

function generate_transform() {
	const height = parseInt(ele_slider_height.value);
	const weight = parseInt(ele_slider_weight.value);
	const BMI = weight / Math.pow(height/100, 2);

	// 기준값(170)일 때 Y가 1.
	return `scaleY(${height/170}) scaleX(${1 + (BMI - 20) * 0.02})`;
}

function show_index_page(index, first_call=false) {
	if(!first_call) document.querySelector('.inquiry-section.show').classList.remove('show');
	document.querySelector(`.inquiry-section[data-page="${index}"]`).classList.add('show');

	ele_ind_text.innerText = `${index+1} OF ${page_count}`;
	// 바가 모두 채워질 때 넘어가기 위해
	ele_ind_bar_filled.style.width = `${((index+1) / (page_count+1)) * ele_ind_bar.offsetWidth}px`;
}
