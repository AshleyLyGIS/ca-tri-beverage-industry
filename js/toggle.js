(function () {

    const widthBreak = 800;

    const legendButton = document.querySelector('#legend-button');
    const legend = document.querySelector('#legend');

    legendButton.addEventListener('click', function () {
        toggle()
    })

    if (window.innerWidth <= widthBreak) {
        toggle();
    }

    function toggle() {

        if (legend.style.display === "none") {
            legend.style.display = "block";
        } else {
            legend.style.display = "none";
        }
    }

})();