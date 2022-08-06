
$(document).ready(()=>{
    // Attach approve article functions to articles that haven't been approved
    $('.approve-article').click(function(){
        var articleno = $(this).data('articleno');
        var url = '/approve/'+articleno;
        if(confirm('Approve Article?')){
            $.ajax({
                url: url,
                type: 'GET',
                success: function(result){
                    console.log('Approving article...');
                    window.location.href='/';
                },
                error: function(err){
                    console.log(err);
                }
            });
        }
    });

    // Fill edit article dialog with previous article values
    $('.edit-article').click(function(){
        $('#edit-form-articleno').val($(this).data('articleno'));
        $('#edit-form-ar_contenthtml').val($(this).data('ar_contenthtml'));
    });

    // Fill view article dialog with article html
    $('.view-article').click(function(){
        $('#view-modal-ar_contenthtml').val($(this).data('ar_contenthtml'));
    });

    // Fill edit tags dialog with existing article tags
    $('.edit-tags').click(function(){
        $('#edit-tags-form-articleno').val($(this).data('articleno'));
        $('#edit-tags-form-tags').val($(this).data('tags'));
    });
});