$(document).ready(function (){
  console.info('Loading app resources');
	
	dhis2.period.format = 'yyyy-mm-dd';
  dhis2.period.calendar = $.calendars.instance('nepali');
  dhis2.period.generator = new dhis2.period.PeriodGenerator( dhis2.period.calendar, dhis2.period.format );
	dhis2.period.picker = new dhis2.period.DatePicker( dhis2.period.calendar, dhis2.period.format );
	
 
  var calendar = $.calendars.instance('nepali');
  var monthNames = calendar.local.monthNames;
  
	// Get the server date
	var serverDate;
	$.getJSON('../../../../api/system/info').done(systemInfo => {
		//console.log('Server Date: '+systemInfo.serverDate.substring(0, 10));
		serverDate = systemInfo.serverDate.substring(0, 10);
	});
	
	// Set the maximum selectable date
	//var maxDate = new Date(dhis2.period.picker.defaults.maxDate.toString());
	//maxDate.setDate(maxDate.getDate());
	
	// Set the minimum selectable date
	//var minDate = new Date(dhis2.period.picker.defaults.maxDate.toString());
	//minDate.setDate(minDate.getDate()-1);
 
  var month;
  var bimonth;
  var quarter;
  var sixmonth;
  var financialyear;
  var year;
  
  // Get current periods
  var periodTypes = ['THIS_MONTH','THIS_BIMONTH','THIS_QUARTER','THIS_SIX_MONTH','THIS_FINANCIAL_YEAR','THIS_YEAR'];
  $("#periodtypes").append("<option>Select Period Type</option>");
  $.each(periodTypes, function(i, ps) {       
     var option = '<option value="'+ps.replace("THIS_","")+'">'+ps.replace("THIS_","")+'</option>';
     $("#periodtypes").append(option);
  });
  
  $("#periodtypes").append('<option value="SIX_MONTHLY_APRIL">SIX MONTHLY APRIL</option>');
  
  var url = '../../../../api/analytics.json?dimension=dx:dbpmbNlJShP&dimension=pe:'+periodTypes.join(';')+'&outputIdScheme=NAME&filter=ou:USER_ORGUNIT';
  $.getJSON(url).done(currentperiods => {
      var currentPeriods = currentperiods.metaData.dimensions.pe;
      month = currentPeriods[0].substr(4,2);
      bimonth = currentPeriods[1].substr(4,2);
      quarter = currentPeriods[2].substr(4,2);
      sixmonth = currentPeriods[3].substr(4,2);
      financialyear = currentPeriods[4];
      year = currentPeriods[5];
      console.log(url);

	});
 
	
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
        //orgUnit += ";"+ou.id;
      });
	  });
	});
 
  // Get data sets
  $.getJSON('../../../../api/dataSets?fields=id,displayName,formType&paging=false').done(datasets => {

      $("#dataset").empty();
      $("#dataset").append("<option>Select Data Set</option>");
      
      $.each(datasets.dataSets, function(i, ds) {       
        var option = '<option value="'+ds.id+'">'+ds.displayName+'</option>';
        $("#dataset").append(option);
      });
	});
  
  $("#periodtypes").change(function(){
    var periodtype = $("#periodtypes option:selected" ).val();
    $("#periods").empty();
    loadPeriods(year, periodtype);
  });
  
  function loadPeriods(year, periodtype){

    // Monthly
    if(periodtype == 'MONTH'){
      for (var i=0; i<=11; i++){
        $("#periods").append('<option value="'+ year + (i+1).toLocaleString('en-US', {minimumIntegerDigits:2, useGrouping:false}) +'">'+ monthNames[i] + " " + year +'</option>');
      }  
    }
    
    if(periodtype == 'BIMONTH'){
      var bm = 1;
      
      for (var i=0; i<=11; i=i+2){
        var name = monthNames[i]+"-"+monthNames[i+1];
        $("#periods").append('<option value="'+ year + (bm).toLocaleString('en-US', {minimumIntegerDigits:2, useGrouping:false}) +'B">'+ name + " " + year +'</option>');
        bm++;
      }  
    }
    
    if(periodtype == 'QUARTER'){
      var q = 1;
      
      for (var i=0; i<=11; i=i+3){
        var name = monthNames[i]+"-"+monthNames[i+2];
        $("#periods").append('<option value="'+ year +"Q"+ q+'">'+year + " " + name +'</option>');
        q++;
      }  
    }
    
    if(periodtype == 'SIX_MONTH'){
      var sm = 1;
      
      for (var i=0; i<=11; i=i+6){
        var name = monthNames[i]+"-"+monthNames[i+5];
        $("#periods").append('<option value="' + year + "S" + sm +'">'+year + " " + name +'</option>');
        q++;
      }  
    }
    
    if(periodtype == 'FINANCIAL_YEAR'){
      var fy = parseInt(year);
      if(month < 4){
        fy = parseInt(year) - 1;
      }
      
      for (var i=5; i>0; i--){
        var name = fy + "Shrawan - " + (fy+1) + "Ashad";
        $("#periods").append('<option value="' + fy + "April" + '">'+ name +'</option>');
        fy--;
      }  
    }
    
    if(periodtype == 'YEAR'){
      var y = parseInt(year);
      
      for (var i=5; i>0; i--){
        $("#periods").append('<option value="' + y + '">'+ y +'</option>');
        y--;
      }  
    }
    
    if(periodtype == 'SIX_MONTHLY_APRIL'){
      var fysm = 1;
      
      var fy = parseInt(year);
      if(month < 10){
        fy = parseInt(year) - 1;
      }
      
      for (var i=0; i<12; i=i+6){
        var startMonth = fy + monthNames[i+3];
        var endMonth = fy + monthNames[i+8];
        if(i+8 > 12){
          endMonth = (fy+1) + monthNames[(12 - (i+8) + 4)];
        }
        
        var name = startMonth+"-"+endMonth;
        $("#periods").append('<option value="' + fy + "AprilS" + fysm +'">'+ name +'</option>');
        fysm++;
      } 
    }
  }
  
  $("#previous").click(function(){
    var periodtype = $("#periodtypes option:selected" ).val();
    year = year - 1;
    $("#periods").empty();
    loadPeriods(year, periodtype);    
  });
  
  
  $("#next").click(function(){
    var periodtype = $("#periodtypes option:selected" ).val();
    year = year + 1;
    $("#periods").empty();
    loadPeriods(year, periodtype);    
  });
   
 
  $("#getreport").click(function(){
    $('#tableview').html('<p>Loading report...</p>'); 
    var ds = $("#dataset").val();
    var pe = $("#periods").val();
        
    var reporturl = '../../../../api/dataSetReport/custom?filter=&ds='+ds+'&pe='+pe+'&ou='+orgUnit+'&selectedUnitOnly=true';
    //$('#tableview').load(reporturl);
    
    $.ajax({url:reporturl,
      dataType: 'html',
      success: function(result){ 
        $('#tableview').empty(); 
        $('#tableview').append("<h3 style='margin-top:0;'>Data Set Report, <i>"+$('#orgUnitName').val() +"</i>, <i>"+$("#dataset option:selected" ).text()+"</i></h3>"); 
        result = result.replaceAll('script','noscript');
        $('#tableview').append(result);
        
        $('#tableview gridDiv table').addClass("table-striped");
            
        var downloadxls = reporturl.replace('/custom','.xls');
        var downloadcsv = reporturl.replace('/custom','csv');
        var downloadButtons = '<div style="margin-top:10px;padding:5px; border:1px solid #ccc;"><a href="'+downloadxls+'" class="btn btn-primary" role="button">Download Excel</a> ';
        downloadButtons += '<a href="'+downloadcsv+'" class="btn btn-primary" role="button">Download CSV</a></div>'
        $('#tableview').append(downloadButtons);
    },
    error: function (jqXHR, exception) {
      console.log(jqXHR);
      console.log(exception);
      $('#tableview').html("Error getting the requested report, please try again.");
    }
  });
    
    /*$.get(reporturl).done(result => {      
      $('#tableview').empty(); 
      $('#tableview').append("<h3 style='margin-top:0;'>Data Set Report, <i>"+$('#orgUnitName').val() +"</i>, <i>"+$("#dataset option:selected" ).text()+"</i></h3>"); 
      $('#tableview').append(result);
            
      var downloadxls = reporturl.replace('html','xls');
      var downloadcsv = reporturl.replace('html','csv');
      var downloadButtons = '<div style="margin-top:10px;padding:5px; border:1px solid #ccc;"><a href="'+downloadxls+'" class="btn btn-primary" role="button">Download Excel</a> ';
      downloadButtons += '<a href="'+downloadcsv+'" class="btn btn-primary" role="button">Download CSV</a></div>'
      $('#tableview').append(downloadButtons);
	  });*/
    
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