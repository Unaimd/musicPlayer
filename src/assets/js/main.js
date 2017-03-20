$(document).ready(function (){
    
    // show options
    $('#audioplayer').find('[name="options"]').click(function() {
        $('html').addClass('noScroll');
        $('#options').removeClass('hidden');
        $('#options').hide();
        $('#options').fadeIn();
    });
    
    // hide options
    $('#options').find('[data-action="close"]').click(function() {
        $('#options').slideUp(function(){
            $('html').removeClass('noScroll');
        });
    });
    
    // change order of songs 
    $('#songs').children('thead').find('th').click(function() {
        $mode = $(this).attr('class');

        if (typeof $(this).attr('data-order') === 'undefined' || $(this).attr('data-order') == 'Desc'){
            $order = 'Asc';
            $icon = '<i class="fa fa-sort-asc"></i>';

        } else {
            $order = 'Desc';
            $icon = '<i class="fa fa-sort-desc"></i>';

        }
        $('#songs').find('thead').find('i').remove();
        $('#songs').find('thead').find('.'+$mode).append($icon);
        $('#songs').find('thead').find('.'+$mode).attr('data-order',$order);

        $('#songs').find('tbody').children().remove();
        $('#songs').find('tbody').append('<input type="hidden" name="lastSong">');

        window.history.pushState("", document.title, "/"+$mode+"/"+$order);

        loadSongs($audioFolder,$loadAfter, $mode+$order,0);
    });
});