$(document).ready(function (){
  console.info('Loading app resources');
	
	dhis2.period.format = 'yyyy-mm-dd';
  dhis2.period.calendar = $.calendars.instance('gregorian');
  dhis2.period.generator = new dhis2.period.PeriodGenerator( dhis2.period.calendar, dhis2.period.format );
	dhis2.period.picker = new dhis2.period.DatePicker( dhis2.period.calendar, dhis2.period.format );
	
	// Get the server date
	var serverDate;
	$.getJSON('../../../../api/system/info').done(systemInfo => {
		console.log('Server Date: '+systemInfo.serverDate.substring(0, 10));
		serverDate = systemInfo.serverDate.substring(0, 10);
	});
	
	// Set the maximum selectable date
	var maxDate = new Date(dhis2.period.picker.defaults.maxDate.toString());
	maxDate.setDate(maxDate.getDate());
	
	// Set the minimum selectable date
	var minDate = new Date(dhis2.period.picker.defaults.maxDate.toString());
	minDate.setDate(minDate.getDate()-1);
	 
  // Get resource list
  $.getJSON('../../../../api/documents?fields=id,name,created,createdBy[displayName],contentType,displayName&paging=false').done(resourceList => {
            
      var $table = $('<table/>');
      $table.addClass("table");
      $table.attr("id", "datatable");
      var $headerTr = $('<tr/>');
      $headerTr.append($('<th/>').html('Name'));
      $headerTr.append($('<th/>').html('Created Date'));
      $headerTr.append($('<th/>').html('Created By'));
      $headerTr.append($('<th/>').html('Action'));
      $table.append($headerTr);
      
      var docs = resourceList.documents;
      docs.sort((a, b) => b.created.localeCompare(a.created));
      
      $.each(docs,function(i, doc){
        var $tableTr = $('<tr/>');
        var id = doc.id;
        $tableTr.append($('<td/>').html(doc.name));
        $tableTr.append($('<td/>').html(doc.created.substring(0,10)));
        $tableTr.append($('<td/>').html(doc.createdBy.displayName));
        $tableTr.append($('<td/>').html('<a href="../../../../api/documents/' + id + '/data">Get Resource</a>'));
        $table.append($tableTr);
      });
      
      $('#tableview').empty(); 
      $('#tableview').append("<h3 style='margin-top:0;padding-top:0'>HMIS Resources</h3>");
      $('#tableview').append($table);
      //$('#datatable').dataTable();
	});
 	
	// Organization Unit search
	$("#searchField").autocomplete({
		source: "../../../../dhis-web-commons/ouwt/getOrganisationUnitsByName.action",
		select: function(event,ui) {
			$("#searchField").val(ui.item.value);
			selection.findByName();
		}
	});
  
});