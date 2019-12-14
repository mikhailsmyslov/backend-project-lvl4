import $ from 'jquery';
import moment from 'moment';
import { intersection, isEmpty } from 'lodash';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'jquery-ujs';
import 'datatables.net-bs4/css/dataTables.bootstrap4.min.css';
import 'datatables.net-bs4';
import '../vendor/pictures/favicon.png';
import '../vendor/pictures/logo.png';
import '../vendor/plugins/katweKibsletterAvatarjs';
import '@fortawesome/fontawesome-free/js/all.min';
import 'bootstrap4-tagsinput/tagsinput';
import 'bootstrap4-tagsinput/tagsinput.css';
import 'bootstrap-select/dist/js/bootstrap-select.min';
import 'bootstrap-select/dist/css/bootstrap-select.min.css';
import 'summernote/dist/summernote-bs4.css';
import '../vendor/css/summernote-z-index-fix.css';
import '../vendor/css/icon-link.css';
import '../vendor/css/bs-select-item-aligment-fix.css';
import 'summernote/dist/summernote-bs4.min';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.standalone.min.css';
import 'bootstrap-datepicker';
import 'bootstrap-colorpicker/dist/css/bootstrap-colorpicker.css';
import 'bootstrap-colorpicker/dist/js/bootstrap-colorpicker';

$('.data-table').DataTable();
$('.data-table-scroll-Y').DataTable({
  scrollY: '320px',
  scrollCollapse: true
});
$('.tags-input').tagsinput({
  tagClass: 'badge badge-pill badge-secondary mr-1',
  trimValue: true,
  maxChars: 20,
  maxTags: 10
});
$('.summernote').summernote({
  height: 300,
  disableResizeEditor: true,
  tabDisable: false,
  toolbar: [
    ['style', ['style']],
    ['font', ['bold', 'underline', 'italic']],
    ['para', ['ul', 'ol', 'paragraph']],
    ['table', ['table']],
    ['insert', ['link', 'picture']],
    ['view', ['fullscreen']]
  ]
});
$('.input-daterange').datepicker({
  todayBtn: 'linked',
  clearBtn: true,
  autoclose: true,
  todayHighlight: true
});
const calculateDuration = () => {
  const startDate = $('[name="startDate"]').datepicker('getDate');
  const endDate = $('[name="endDate"]').datepicker('getDate');
  const timeDiff = moment(endDate).diff(startDate, 'days');
  const duration = timeDiff >= 0 ? `${timeDiff + 1} d` : '---';
  $('#duration').text(duration);
};
calculateDuration();
$('.datepicker')
  .datepicker()
  .on('changeDate', calculateDuration);

$('.selectpicker').on('changed.bs.select', ({ target }, clickedIndex) => {
  const singleSelectValues = ['all', 'unassigned', 'me'];
  const { selectedOptions } = target;
  const selectedValues = [...selectedOptions].map(opt => opt.value);
  const intersect = intersection(singleSelectValues, selectedValues);
  if (!isEmpty(intersect)) {
    $(target)
      .val(target[clickedIndex].value)
      .selectpicker('refresh');
  }
});

$('#colorpicker').colorpicker();
$('#colorpicker').on('colorpickerChange colorpickerCreate', event => {
  $('#colorpicker-preview').css('background-color', event.color.toString());
});
