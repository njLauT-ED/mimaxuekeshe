//jshint esversion:8
module.exports = {
    'GET /': async (ctx, next) => {
        console.log(ctx.state.user);
        let user = ctx.state.user;
        if (user) {
            ctx.render('room.html', {
                user: user
            });
        } else {
            ctx.response.redirect('/signin');
        }
    } 
};
