const PROJECT_PREFIX = 'health-report-210729-';


window.onload = () => {
	document.body.classList.add('loaded-window');
};


if(localStorage[`${PROJECT_PREFIX}_basic_done`] === "1") {
	const height = get_ls_value('height');
	const weight = get_ls_value('weight');
	const age = get_ls_value('age');
	const gender = get_ls_value('gender');
	
	populate_as_is([
		"height",
		"weight",
		"age"
	]);

	const bmi = weight / Math.pow(height/100, 2);

	populate_by_pair([
		{name: 'calc_bmi', value: bmi.toFixed(1)},
	]);

	// comment-basic-info
	// 비교적 높은 BMI를 갖고 계시네요. 저희와 함께 관리해보시는 게 어떠세요?

	if(localStorage[`${PROJECT_PREFIX}_additional_done`] === "1") {
		const bfat_current = parseFloat(get_ls_value('bfat-current-percent')) * weight / 100;
		const bfat_target = parseFloat(get_ls_value('bfat-target-percent')) * weight / 100;
		const weight_target = weight - (bfat_current - bfat_target);
		const metarate = 350+21.6*(weight - bfat_current)+7*bfat_current;
		const activity_num = [get_ls_value('activity')];
		const activity_as_text = ['적거나 없음', '가벼운 활동', '보통의 활동', '적극적인 활동'][activity_num];
		const metarate_active_mod = [.2, .375, .555, .725][activity_num];
		const metarate_active = metarate * metarate_active_mod;
		const metarate_sustain = metarate + metarate_active;

		// bfat_target이 bfat_current보다 클 경우 역시 처리하도록.
		const fat_to_reduce = bfat_current - bfat_target;

		const date_now = new Date();
		const days_span = fat_to_reduce / (1.5/30);
		const date_target = new Date(date_now.getTime());
		date_target.setDate(date_now.getDate() + days_span);


		const kcal_consume_total = 7200 * (weight - weight_target);
		const kcal_daily_total = (metarate_sustain - (kcal_consume_total/days_span));

		let comment_fin;

		if(kcal_daily_total <= (metarate * 1.1)) {
			comment_fin = '목표가 너무 높은 것 같아요 😩';
		} else if(kcal_daily_total >= (metarate * 2.2)) {
			comment_fin = '근비대가 목표라도 너무 높아요 😱';
		} else {
			comment_fin = '적당한 목표에요 🎉';
		}
		
		populate_by_pair([
			{name: 'bfat-current-percent', value: get_ls_value('bfat-current-percent')},
			{name: 'calc-bfat-current', value: bfat_current.toFixed(2)},
			{name: 'calc-bfat-current-inverse', value: (weight - bfat_current).toFixed(2)},
			{name: 'calc-weight-target', value: weight_target.toFixed(2)},
			{name: 'calc-bfat-target', value: bfat_target.toFixed(2)},
			{name: 'calc-bfat-target-inverse', value: (weight - bfat_target).toFixed(2)},
			{name: 'bfat-target-percent', value: get_ls_value('bfat-target-percent')},
			{name: 'calc-metarate-resting', value: metarate.toFixed(0)},
			{name: 'calc-activity-text', value: activity_as_text},
			{name: 'calc-metarate-active', value: metarate_active.toFixed(0)},
			{name: 'calc-metarate-sustain', value: metarate_sustain.toFixed(0)},
			{name: 'calc-date-now', value: date_format(date_now)},
			{name: 'calc-timespan', value: days_span.toFixed(1)},
			{name: 'calc-date-finish', value: date_format(date_target)},
			{name: 'calc-kcal-total', value: kcal_consume_total.toFixed(0)},
			{name: 'calc-kcal-daily-consume', value: (kcal_consume_total/days_span).toFixed(0)},
			{name: 'calc-kcal-daily-total', value: kcal_daily_total.toFixed(0)},
			{name: 'calc-comment-fin', value: comment_fin},
		]);

		// comment-target
		// 현재 체지방률과 목표 체지방률에 큰 차이가 나지 않아요. 꾸준함만 있으면 목표를 곧 달성하실 수 있을 거에요.
	} else {
		// 강제 이동이 아닌 메인 페이지를 제공하거나, 젠틀한 표현 방식으로 변경이 필요.
		window.location = 'register.html';
	}
} else {
	// 강제 이동이 아닌 메인 페이지를 제공하거나, 젠틀한 표현 방식으로 변경이 필요.
	window.location = 'register.html';
}

function get_ls_value(name) {
	return localStorage[`${PROJECT_PREFIX}${name}`];
}

function populate_as_is(targets) {
	targets.forEach(target => {
		document.querySelectorAll(`.value[data-for=${target}]`).forEach(elem => {
			elem.innerText = get_ls_value(target);
		});
	});
}

function populate_by_pair(pairs) {
	pairs.forEach(pair => {
		document.querySelectorAll(`.value[data-for=${pair.name}]`).forEach(elem => {
			elem.innerText = pair.value;
		});
	});
}

function date_format(date) {
	return `${date.getFullYear()}-${(date.getMonth() < 9?'0':'') + (date.getMonth() + 1)}-${(date.getDay() < 10?'0':'') + date.getDay()}`;
}