const PROJECT_PREFIX = 'health-report-210729-';

if(localStorage[`${PROJECT_PREFIX}_basic_done`] !== "1") {
	window.location = 'register.html';
}
	

const ele_inq_main = document.querySelector('.inquiry-main');
const ele_ind_text = document.querySelector('.indicator-text');
const ele_inq_ind = document.querySelector('.inquiry-indicator');
const ele_ind_bar = document.querySelector('.indicator-bar');
const ele_ind_bar_filled = document.querySelector('.indicator-bar-filled');
const ele_slider_bfat_current = document.querySelector('.slider-bodyfat-current');
const ele_slider_bfat_target = document.querySelector('.slider-bodyfat-target');
const ele_visual_bfat = document.querySelector('.visual-que-body-fat');
let index_start = 0;
let index_current = index_start;
let page_count = 3;

const height = Number(localStorage[`${PROJECT_PREFIX}height`]);
const weight = Number(localStorage[`${PROJECT_PREFIX}weight`]);
const gender = Number(localStorage[`${PROJECT_PREFIX}gender`]);
const age = Number(localStorage[`${PROJECT_PREFIX}age`]);

const gender_related = {
	recommanded_vfat: [15, 20],
	step: [
		[35, 25, 15, 8],
		[45, 40, 35, 30, 25, 20, 15],
	],
};

const bfat_slider_colorizer = {
	// info[gender]
	info: [
		{
			// 전체적인 배경이 되는 색상
			default_bg: 'rgb(231, 76, 60)',
			// gender_related.step에 있는 value 이하로 내려갈 때마다 어떤 색상으로 영역을 표현할지에 대응되는 array
			step: [
				'rgb(230, 126, 34)',
				'rgb(241, 196, 15)',
				'rgb(46, 204, 113)',
				'rgb(52, 152, 219)',
			],
		}
	],
	colorize(...targets) {
		targets.forEach(slider => {
			// 슬라이더의 너비
			const slider_width = slider.offsetWidth;
			// 슬라이더가 허용하는 최대값
			const slider_val_max = parseFloat(slider.getAttribute('max'));
			// 슬라이더에 쓰일 배경색 정보를 가진 객체를 할당
			const slider_helper_info = this.info[gender];
		
			const ele_slider_helper = document.createElement('div');
			ele_slider_helper.classList.add('slider-helper');
			ele_slider_helper.style.backgroundColor = slider_helper_info.default_bg;
		
			slider_helper_info.step.forEach((step, index) => {
				const step_val = gender_related.step[gender][index];
				const step_percentage = (step_val / slider_val_max);
		
				const ele_slider_helper_inner = document.createElement('div');
				ele_slider_helper_inner.classList.add('slider-helper-inner');
				ele_slider_helper_inner.style.width = slider_width * step_percentage + 'px';
				ele_slider_helper_inner.style.backgroundColor = step;
				ele_slider_helper.appendChild(ele_slider_helper_inner);
			});
		
			slider.parentElement.appendChild(ele_slider_helper);
		});
	}
};


const bfat_suggested = +calculate_body_fat(gender, age, height, weight).toFixed(1);

ele_slider_bfat_current.value = bfat_suggested;
// 현재 추측된 bfat(bfat_suggested)이 성별에 따라 추천되는 bfat 값보다 작을 경우, 현재값을 그대로 사용함.
ele_slider_bfat_target.value = Math.min(bfat_suggested, gender_related.recommanded_vfat[gender]);
document.querySelector(`.inquiry-num-input[for="bodyfat-current"] .inquiry-num-input-value`).innerText = bfat_suggested;
document.querySelector('.inquiry-desc[for="bodyfat-current"]').innerHTML =
	`저희는 회원님의<br>현재 체지방률을 ${bfat_suggested}%로 추정했어요<br>정확하지 않다면 수정해주세요`;
mod_slider(ele_slider_bfat_current);
mod_slider(ele_slider_bfat_target);

document.querySelector('.inquiry-desc[for="bodyfat-target"]').innerText =
	gender === 0
	? '남성 기준 건강 체지방률은 15~20%에요'
	: '여성 기준 건강 체지방률은 20~25%에요';

window.onload = () => {
	document.body.classList.add('loaded-window');
};

bfat_slider_colorizer.colorize(ele_slider_bfat_current, ele_slider_bfat_target);
show_index_page(index_current, true);


document.querySelectorAll('.inquiry-activity-option').forEach(e => {
	e.addEventListener('click', ev => {
		ele_inq_main.setAttribute('data-activity', e.getAttribute('data-for'));
		localStorage[`${PROJECT_PREFIX}activity`] = e.getAttribute('data-for-as-number');
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

[ele_slider_bfat_current, ele_slider_bfat_target].forEach(slider => {
	slider.addEventListener('input', ev => mod_slider(slider));
});




function calculate_body_fat(gender, age, height, weight) {
	const BMI = weight / Math.pow(height/100, 2);
	return (-44.988 + (0.503 * age) + (10.689 * gender) + (3.172 * BMI) - (0.026 * Math.pow(BMI, 2)) + (0.181 * BMI * gender) - (0.02 * BMI * age) - (0.005 * Math.pow(BMI, 2) * gender) + (0.00021 * Math.pow(BMI, 2) * age));
}

function prev_slide() {
	index_current--;
	show_index_page(index_current);
}

function next_slide() {
	index_current++;
	if(index_current >= page_count) {
		show_index_page('fin');
		document.body.classList.add('congrat');

		localStorage[`${PROJECT_PREFIX}bfat-current-percent`] = ele_slider_bfat_current.value;
		localStorage[`${PROJECT_PREFIX}bfat-target-percent`] = ele_slider_bfat_target.value;
		localStorage[`${PROJECT_PREFIX}_additional_done`] = 1;

		ele_inq_ind.classList.add('hide');

		setTimeout(() => {
			document.querySelector(`.inquiry-section[data-page="fin"]`).classList.add('slide-out');
			document.querySelector(`.inquiry-section[data-page="fin-next"]`).classList.add('show');
		}, 3000);
		return;
	}
	show_index_page(index_current);
}

function mod_slider(slider) {
	const slider_value = parseFloat(slider.value);
	const slider_for = slider.getAttribute('for');
	console.log(`.inquiry-num-input[for="${slider_for}"] .inquiry-num-input-value`);
	document.querySelector(`.inquiry-num-input[for="${slider_for}"] .inquiry-num-input-value`).innerText = slider_value;
	const diff = ele_slider_bfat_target.value - ele_slider_bfat_current.value;
	document.querySelector(`.inquiry-num-input[for="bodyfat-target"] .inquiry-num-input-diff`).innerText =
		`${(diff>0?'+':'') + (diff).toFixed(1)}%`;
	modify_bfat_que(slider);
}

function modify_bfat_que(slider) {
	const bfat = parseFloat(slider.value);
	const slider_for = slider.getAttribute('for');
	const ele_visual_bfat = document.querySelector(`.visual-que-body-fat[for="${slider_for}"]`);
	ele_visual_bfat.setAttribute('data-step', 5);
	gender_related.step[gender].forEach((e, i) => {
		if(bfat < e) {
			// console.log(bfat, e, gender_related.step[gender].length - i);
			ele_visual_bfat
				.setAttribute('data-step', gender_related.step[gender].length - i);
		}
	});
}

function show_index_page(index, first_call=false) {
	if(!first_call) document.querySelector('.inquiry-section.show').classList.remove('show');
	document.querySelector(`.inquiry-section[data-page="${index}"]`).classList.add('show');

	ele_ind_text.innerText = `${index+1} OF ${page_count}`;
	// 바가 모두 채워질 때 넘어가기 위해
	ele_ind_bar_filled.style.width = `${((index+1) / (page_count+1)) * ele_ind_bar.offsetWidth}px`;
}
