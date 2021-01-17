// const { text } = require("body-parser");
function insertText(textarea, text) {
	// https://stackoverflow.com/a/55174561/288906
	if (!document.execCommand('insertText', false, text)) {
		textarea.setRangeText(text);
	}
}
var selectionIndex1;
var selectionIndex2;

function getText(elem) {
    if(elem.tagName === "TEXTAREA" ||
       (elem.tagName === "INPUT" && elem.type === "text")) {
        selectionIndex1=elem.selectionStart;
        selectionIndex2= elem.selectionEnd;
        return elem.value.substring(elem.selectionStart,
                                    elem.selectionEnd);
    }
    return null;
}

setInterval(function() {
    // console.log('first slctn index ='+selectionIndex1);
    // console.log('second slctn index ='+selectionIndex2);
    // console.log(text[selectionIndex2-1]);
    var txt = getText(document.activeElement);
    // document.getElementById('div').innerHTML =
    //     txt === null ? 'no input selected' : txt;
}, 500);

function bold(){
    var toReturn="<b>"+text.slice(selectionIndex1,selectionIndex2)+"</b>";
     text=text.slice(0,selectionIndex1)+"<b>"+text.slice(selectionIndex1,selectionIndex2)+"</b>"+text.slice(selectionIndex2);
    // $('#text').val( toReturn);
   
    document.execCommand("insertText", false, toReturn);

    buildScreenViewer();
  }


  function sameLineEquation(){
    console.log('first slctn index ='+selectionIndex1);
    console.log('second slctn index ='+selectionIndex2);
    var toReturn='';
    if(text[selectionIndex1]=='$'&&text[selectionIndex2-1]=='$'){
        toReturn="\\("+text.slice(selectionIndex1+2,selectionIndex2-2)+"\\)";
        text=text.slice(0,selectionIndex1)+"\\("+text.slice(selectionIndex1+2,selectionIndex2-2)+"\\)"+text.slice(selectionIndex2);

    }else if(text[selectionIndex1]=='\\'&&text[selectionIndex2-1]==')'){
toReturn=text;
    }
    else{
    toReturn="\\("+text.slice(selectionIndex1,selectionIndex2)+"\\)";
        text=text.slice(0,selectionIndex1)+"\\("+text.slice(selectionIndex1,selectionIndex2)+"\\)"+text.slice(selectionIndex2);

    }
    document.execCommand("insertText", false, toReturn);

    buildScreenViewer();
  }

  function mutiLineEquation(){
    console.log('first slctn index ='+selectionIndex1);
    console.log('second slctn index ='+selectionIndex2);
    console.log(text);
    var toReturn='';
    console.log(text[selectionIndex2-1]);
    if(text[selectionIndex1]=='\\'&&text[selectionIndex2-1]==')'){
        console.log(true);
    toReturn="$$"+text.slice(selectionIndex1+2,selectionIndex2-2)+"$$";
    text=text.slice(0,(selectionIndex1))+"$$"+text.slice(selectionIndex1+2,selectionIndex2-2)+"$$"+text.slice(selectionIndex2);

}else{
    toReturn="$$"+text.slice(selectionIndex1,selectionIndex2)+"$$";
    text=text.slice(0,selectionIndex1)+"$$"+text.slice(selectionIndex1,selectionIndex2)+"$$"+text.slice(selectionIndex2);
    
}
    // $('#text').val( toReturn);

    document.execCommand("insertText", false, toReturn);

    buildScreenViewer();
  }

function divideOperator(){
    console.log('first slctn index ='+selectionIndex1);
    console.log('second slctn index ='+selectionIndex2);
    var divideCommand=text.slice(selectionIndex1,selectionIndex2).split('/');
    var toReturn='';
    console.log(divideCommand);
    if(divideCommand.length==2){
    toReturn="{"+divideCommand.join('\\over ')+"}";
    text=text.slice(0,selectionIndex1)+"{"+divideCommand.join('\\over ')+"}"+text.slice(selectionIndex2);
    
}else{
 toReturn="{ "+text.slice(selectionIndex1,selectionIndex2)+"\\over }";
 text=text.slice(0,selectionIndex1)+"{ "+text.slice(selectionIndex1,selectionIndex2)+"\\over }"+text.slice(selectionIndex2);
  
}
    // $('#text').val( toReturn);
  
    document.execCommand("insertText", false, toReturn);
    buildScreenViewer();

  }
  function sqrt(){
    console.log('first slctn index ='+selectionIndex1);
    console.log('second slctn index ='+selectionIndex2);
    console.log(text);
    var toReturn="\\sqrt{"+text.slice(selectionIndex1,selectionIndex2)+"}";
    // text=text.slice(0,selectionIndex1)+"\\sqrt{"+text.slice(selectionIndex1,selectionIndex2)+"}"+text.slice(selectionIndex2);
    // $('#text').val( toReturn);
    document.execCommand("insertText", false, toReturn);
    buildScreenViewer();
  }
  function notEql(){
    document.execCommand("insertText", false, '≠');
    buildScreenViewer();
  }
  function sqr(){
    document.execCommand("insertText", false, '^{}');
    buildScreenViewer();
  }
  function heading(){
    var toReturn="<h3>"+text.slice(selectionIndex1,selectionIndex2)+"</h3>";
    document.execCommand("insertText", false, toReturn);
    buildScreenViewer();
  }
  function subHeading(){
    var toReturn="<h5>"+text.slice(selectionIndex1,selectionIndex2)+"</h5>";
    document.execCommand("insertText", false, toReturn);
    buildScreenViewer();
  }