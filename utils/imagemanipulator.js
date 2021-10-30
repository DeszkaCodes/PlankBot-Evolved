const Canvas = require("canvas");

function ResponsiveText(canvas, edgeOffset, text, fontSize = 24, additionalAttributes = ""){
    const context = canvas.getContext("2d");

    fontSize += 10;

    context.font = `${additionalAttributes} ${fontSize}px verdana`

	do {
		context.font = `${additionalAttributes} ${fontSize -= 2}px verdana`;
	} while (context.measureText(text).width > canvas.width - edgeOffset);

	return context.font;
};

module.exports = {
    ResponsiveText
}