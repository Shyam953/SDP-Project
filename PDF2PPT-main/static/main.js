document.getElementById('hd').addEventListener('click', getSelectedText1);
document.getElementById('mp').addEventListener('click', getSelectedText2);
document.getElementById('sp').addEventListener('click', getSelectedText3);

var mpFlag = 0, tFlag = 0;

var data_arr = [];

$("#download-file").hide();
$("#loading-button").hide();

data_arr.push(String("<root>"));

var __PDF_DOC,
  __CURRENT_PAGE,
  __TOTAL_PAGES,
  __PAGE_RENDERING_IN_PROGRESS = 0,
  __CANVAS = $('#pdf-canvas').get(0),
  __CANVAS_CTX = __CANVAS.getContext('2d');
window.devicePixelRatio = 2;


function showPDF(pdf_url) {
  $("#pdf-loader").show();

  PDFJS.getDocument({ url: pdf_url }).then(function (pdf_doc) {
    __PDF_DOC = pdf_doc;
    __TOTAL_PAGES = __PDF_DOC.numPages;

    // Hide the pdf loader and show pdf container in HTML
    $("#pdf-loader").hide();
    $("#pdf-contents").show();
    $("#pdf-total-pages").text(__TOTAL_PAGES);

    // Show the first page
    showPage(1);
  }).catch(function (error) {
    // If error re-show the upload button
    $("#pdf-loader").hide();
    $("#upload-button").show();

    alert(error.message);
  });;
}

function showPage(page_no) {
  __PAGE_RENDERING_IN_PROGRESS = 1;
  __CURRENT_PAGE = page_no;

  // Disable Prev & Next buttons while page is being loaded
  $("#pdf-next, #pdf-prev,#crop-btn,#done-btn").attr('disabled', 'disabled', 'disabled', 'disabled');

  // While page is being rendered hide the canvas and show a loading message
  $("#pdf-canvas").hide();
  $("#page-loader").show();

  // Update current page in HTML
  $("#pdf-current-page").text(page_no);

  // Fetch the page
  __PDF_DOC.getPage(page_no).then(function (page) {
    // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
    var scale_required = __CANVAS.width / page.getViewport(1).width;

    // Get viewport of the page at required scale
    var viewport = page.getViewport(scale_required);


    // Set canvas height
    __CANVAS.height = viewport.height;

    var renderContext = {
      canvasContext: __CANVAS_CTX,
      viewport: viewport
    };

    // Render the page contents in the canvas
    page.render(renderContext).then(function () {
      __PAGE_RENDERING_IN_PROGRESS = 0;

      // Re-enable Prev & Next buttons
      $("#pdf-next, #pdf-prev,#crop-btn,#done-btn").removeAttr('disabled');

      // Show the canvas and hide the page loader
      $("#pdf-canvas").show();
      $("#page-loader").hide();

      // Return the text contents of the page after the pdf has been rendered in the canvas
      return page.getTextContent();
    }).then(function (textContent) {
      // Get canvas offset
      var canvas_offset = $("#pdf-canvas").offset();

      // Clear HTML for text layer
      $("#text-layer").html('');

      // Assign the CSS created to the text-layer element
      $("#text-layer").css({ left: canvas_offset.left + 'px', top: canvas_offset.top + 'px', height: __CANVAS.height + 'px', width: __CANVAS.width + 'px' });

      // Pass the data to the method for rendering of text over the pdf canvas.
      PDFJS.renderTextLayer({
        textContent: textContent,
        container: $("#text-layer").get(0),
        viewport: viewport,
        textDivs: []
      });
    });
  });
}

// Upon click this should should trigger click on the #file-to-upload file input element
// This is better than showing the not-good-looking file input element
$("#upload-button").on('click', function () {
  $("#file-to-upload").trigger('click');
});

// When user chooses a PDF file
$("#file-to-upload").on('change', function () {
  // Validate whether PDF
  if (['application/pdf'].indexOf($("#file-to-upload").get(0).files[0].type) == -1) {
    alert('Error : Not a PDF');
    return;
  }
  $("#upload-button").hide();

  // Send the object url of the pdf
  showPDF(URL.createObjectURL($("#file-to-upload").get(0).files[0]));
});

// Previous page of the PDF
$("#pdf-prev").on('click', function () {
  if (__CURRENT_PAGE != 1)
    showPage(--__CURRENT_PAGE);
});

// Next page of the PDF
$("#pdf-next").on('click', function () {
  if (__CURRENT_PAGE != __TOTAL_PAGES)
    showPage(++__CURRENT_PAGE);
});

// Go to direct desire page
$("#goto").on('click', function () {
  var a = parseInt($("#pgno").val());
  if (a >= 1 && a <= __TOTAL_PAGES)
    showPage(a);
});

// Crop button for taking picture for PPT in the modal  
$("#crop-btn").on('click', function () {

  $("#image").attr("src", __CANVAS.toDataURL());
  $("#modal").modal("show");

  var image = document.getElementById("image");
  var cropBoxData;
  var canvasData;
  var cropper;
  $("#modal").on("shown.bs.modal", function () {
    cropper = new Cropper(image, {
      viewMode: 3,
      minCropBoxWidth: 200,
      minCropBoxHeight: 200,
    });
    $("#modal").on("hidden.bs.modal", function () {
      cropper.destroy();
    });
    $(".js-crop-and-upload").on('click', function () {
      var imagem = cropper.getCroppedCanvas().toDataURL("image/png");
      data_arr.push(String('<img id="' + imagem + '"></img>'));
      imagem = null;
      console.log("abc");
      cropper.destroy();
      $('#modal').modal('hide');
    });
  });
});


// Get selected text on Title button click
function getSelectedText1() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection) {
    text = document.selection.createRange().text;
  }

  if (tFlag === 0) {
    var a = String('<title id="' + text + '">');
    data_arr.push(a);
    tFlag = 1;
  }
  else {
    if (mpFlag === 0) {
      data_arr.push(String('</title>'));
      tFlag = 0;
      var a = String('<title id="' + text + '">');
      data_arr.push(a);
      tFlag = 1;
    }
    else {
      data_arr.push(String('</mp>'));
      data_arr.push(String('</title>'));
      tFlag = 0;
      mpFlag = 0;
      var a = String('<title id="' + text + '">');
      data_arr.push(a);
      tFlag = 1;
    }
  }
}
// Get selected text on Main Point button click
function getSelectedText2() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection) {
    text = document.selection.createRange().text;
  }

  if (mpFlag === 0) {
    var a = String('<mp id="' + text + '">');
    data_arr.push(a);
    mpFlag = 1;
  }
  else {
    data_arr.push(String('</mp>'));
    mpFlag = 0;
    var a = String('<mp id="' + text + '">');
    data_arr.push(a);
    mpFlag = 1;
  }
}
// Get selected text on Sub Point button click
function getSelectedText3() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection) {
    text = document.selection.createRange().text;
  }
  var a = String('<sp>' + text + '</sp>');
  data_arr.push(a);
}
// Download button click
$(document).ready(function () {
  $("#endt").click(function () {
    if (mpFlag === 1) { data_arr.push(String('</mp>')); }
    if (tFlag === 1) { data_arr.push(String('</title>')); }
    data_arr.push(String("</root>"));
    console.log(data_arr);
    $(".container").hide();
    $("#loading-button").show();
    $.ajax({
      headers: {
        'Authorization': "Token " + localStorage.access_token
      },
      type: 'POST',
      ContentType: 'application/json',
      url: '/edit_lists',
      data: { 'data_arr': JSON.stringify(data_arr) },
      success: function (data) {
        var final_ppt = "http://127.0.0.1:8000/media/" + data;
        console.log(final_ppt);
        $("#download-file").attr("href", final_ppt);
        $("#loading-button").hide();
        $("#download-file").show();
      }
    });
  });
});