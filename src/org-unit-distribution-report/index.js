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
	
  var orgUnit = '';
	// Select organization unit
	var selectedOrgUnit;
	selection.setListenerFunction(function(e){
		selectedOrgUnit = e;
		var selectedOrgUnitName = document.getElementsByClassName("selected")[0].innerHTML;
		document.getElementById('orgUnitName').value = selectedOrgUnitName;
		document.getElementById('orgUnit').value = e[0];
    
    orgUnit = e[0];
    $.getJSON('../../../../api/organisationUnits/'+e[0]+'?paging=false&fields=children[id]').done(ous => {
      $.each(ous.children, function(i, ou) {
        orgUnit += ";"+ou.id;
      });
	  });
	});
 
  // Get OU Group set
  $.getJSON('../../../../api/organisationUnitGroupSets?paging=false&fields=id,name,displayName,shortName').done(ougs => {

      $("#ougroupset").empty();
      $("#ougroupset").append("<option>Select Option</option>");
      
      $.each(ougs.organisationUnitGroupSets, function(i, oug) {       
        var option = '<option value="'+oug.id+'">'+oug.shortName+'</option>';
        $("#ougroupset").append(option);
      });
	});
 
 
  $("#getreport").click(function(){
    var ougs = $("#ougroupset").val();
    var url = '../../../../api/orgUnitAnalytics?ou='+orgUnit+'&ougs='+ougs+'&columns='+ougs;
    
    $.getJSON(url).done(result => {
      
      var $table = $('<table/>');
      $table.addClass("table");
      var $headerTr = $('<tr/>');
      var headerWidth = result.headerWidth;
      
      $.each(result.headers,function(i, header){
        if(i == 0)
          $headerTr.append($('<th/>').html('Organisation Unit'));
        else
          $headerTr.append($('<th/>').html(header.column.toUpperCase()));
      });
      $headerTr.append($('<th/>').html('Total'));
      
      $table.append($headerTr);
      var rows = result.rows;
      rows.sort((a, b) => a[0].localeCompare(b[0]));
      
      $.each(rows,function(i, row){
        var $tableTr = $('<tr/>');
        var total = 0;
        for (var i = 0; i < headerWidth; i++) {
            $tableTr.append($('<td/>').html(row[i]));
            if(i > 0)
              total += (row[i] != '')?parseInt(row[i]):0;
        }
        $tableTr.append($('<td/>').html(total));
        $table.append($tableTr);
      });
      
      $('#tableview').empty(); 
      $('#tableview').append("<h3>OU Distribution in <i>"+$('#orgUnitName').val() +"</i> by <i>"+$("#ougroupset option:selected" ).text()+"</i></h3>"); 
      $('#tableview').append($table);
      
      var downloadxls = '../../../../api/orgUnitAnalytics.xls?ou='+orgUnit+'&ougs='+ougs+'&columns='+ougs;
      var downloadpdf = '../../../../api/orgUnitAnalytics.pdf?ou='+orgUnit+'&ougs='+ougs+'&columns='+ougs;
      $('#tableview').append('<a href="'+downloadxls+'" class="btn btn-primary" role="button" id="getreport">Download Excel</a> ');
      $('#tableview').append('<a href="'+downloadpdf+'" class="btn btn-primary" role="button" id="getreport">Download PDF</a>');

	  });
    
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