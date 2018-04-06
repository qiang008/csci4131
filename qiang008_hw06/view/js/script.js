"use strict";

(function() {
	// the API end point
	var url = "getListOfFavPlaces";

	// TO DO: YOU NEED TO USE AJAX TO CALL getListOfFavPlaces end-point from server
	// STEPS:
	// 1. Hit the getListOfFavPlaces end-point of server using AJAX get method
	// 2. Upon successful completion of API call, server will return the list of places
	// 2. Use the response returned to dynamically add rows to 'myFavTable' present in favourites.html page
	// 3. You can make use of jQuery or JavaScript to achieve this
	// Note: No changes will be needed in favourites.html page
	$.ajax({
		url: url,
		// method: 'put'
	}).done(function(data){
		var htmlstr = data.res.placeList.map(it => {
			return `<tr>
				<td>${it.place_name}</td>
				<td>${it.addr_line1} ${it.addr_line2}</td>
				<td>${it.open_time} / ${it.close_time}</td>
				<td>${it.add_info}</td>
				<td>${it.add_info_url}</td>
			</tr>`
		}).join('');
		document.getElementById('myFavTable').children[1].innerHTML = htmlstr;
	})
})();