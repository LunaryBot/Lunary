const { loadImage, createCanvas, CanvasRenderingContext2D, Canvas } = require('canvas');
const { UserFlags } = require('../lib');
const Template = require('../structures/Template');
const calculate_levels = require('../utils/calculate_levels')
const Sydb = require('sydb');
const profileDB = new Sydb(__dirname + '/../data/profile');

module.exports = class DefaultBlackDesign extends Template {
	constructor(client) {
		super(client, { name: 'DEFAULT_BLACK_DESIGN', dirname: __dirname });
	}

	/**
	 *
	 * @param {{
	 * avatar: string,
	 * username: string,
	 * leftBackgroundName: string,
	 * backgroundName: string,
	 * bio: string,
	 * flags: UserFlags,
	 * emblem: string,
	 * rankPosition: string,
	 * xp: number,
	 * bans: number,
	 * luas: number
	 * }}
	 * @param {CanvasRenderingContext2D} ctxCanvas
	 * @param {Canvas} canvas
	 */
	async build({ avatar, username, leftBackgroundName = 'left_discord_background', backgroundName = 'default', bio = '#ModeraçãoLunatica', flags, emblem, rankPosition = 'N/A', xp = 0, bans = 0, luas = 0 }, ctxCanvas, canvas) {
		if (!ctxCanvas || !canvas) {
			canvas = createCanvas(800, 600);
			ctxCanvas = canvas.getContext('2d');
		}

		const leftBackground =
			this.client.imagesCanvas.get('left_discord_background') ||
			(await (async () => {
				const img = await loadImage('https://media.discordapp.net/attachments/880176654801059860/895718801163812894/unknown.png?width=271&height=498');
				this.client.imagesCanvas.set('left_discord_background', img);
				return img;
			})());

		const background = await (async () => {
			return (
				this.client.imagesCanvas.get(backgroundName) ||
				(await (async () => {
					const img = await loadImage(profileDB.ref(`backgrounds/${backgroundName}`).val() || profileDB.ref(`backgrounds/default`).val());
					this.client.imagesCanvas.set(backgroundName, img);

					return img;
				})())
			);
		})();

		//add background
		ctxCanvas.drawImage(background, 300, 65, 475, 250);

		// left card
		ctxCanvas.fillStyle = 'rgba(255,255,255,1)';
		ctxCanvas.beginPath();
		ctxCanvas.moveTo(0, 65);
		ctxCanvas.lineTo(0, 535);
		ctxCanvas.arcTo(0, 585, 50, 585, 50);
		ctxCanvas.lineTo(250, 585);
		ctxCanvas.lineTo(300, 585);
		ctxCanvas.arcTo(300, 15, 250, 15, 50);
		ctxCanvas.lineTo(50, 15);
		ctxCanvas.arcTo(0, 15, 0, 65, 50);
		ctxCanvas.stroke();
		ctxCanvas.shadowBlur = 10;
		ctxCanvas.shadowOffsetX = 10;
		ctxCanvas.fill();
		ctxCanvas.save();
		ctxCanvas.clip();
		ctxCanvas.drawImage(leftBackground, 0, 0, 300, 600);
		ctxCanvas.restore();

		//add wave shape
		ctxCanvas.beginPath();
		ctxCanvas.moveTo(0, 255);
		ctxCanvas.bezierCurveTo(0, 265, 50, 265, 50, 255);
		ctxCanvas.bezierCurveTo(50, 245, 100, 245, 100, 255);
		ctxCanvas.bezierCurveTo(100, 265, 150, 265, 150, 255);
		ctxCanvas.bezierCurveTo(150, 245, 200, 245, 200, 255);
		ctxCanvas.bezierCurveTo(200, 265, 250, 265, 250, 255);
		ctxCanvas.bezierCurveTo(250, 245, 300, 245, 300, 255);
		ctxCanvas.lineTo(300, 585);
		ctxCanvas.lineTo(50, 585);
		ctxCanvas.arcTo(0, 585, 0, 535, 50);
		ctxCanvas.fillStyle = '#A020F0';
		ctxCanvas.fill();
		ctxCanvas.shadowBlur = 0;

		//add username
		ctxCanvas.beginPath();
		ctxCanvas.font = 'bold 30px sans-serif';
		ctxCanvas.fillStyle = '#ffffff';
		ctxCanvas.textAlign = 'center';
		ctxCanvas.fillText(username, 150, 350, 280);

		//add avatar
		ctxCanvas.beginPath();
		ctxCanvas.arc(150, 225, 75, 0, Math.PI * 2);
		ctxCanvas.lineWidth = 6;
		ctxCanvas.strokeStyle = 'rgba(255,255,255,0.6)';
		ctxCanvas.stroke();
		ctxCanvas.closePath();
		ctxCanvas.save();
		ctxCanvas.clip();
		ctxCanvas.drawImage(await loadImage(avatar), 75, 150, 150, 150);
		ctxCanvas.restore();

		//add center card and wave shape
		ctxCanvas.beginPath();
		ctxCanvas.moveTo(300, 300);

		ctxCanvas.bezierCurveTo(300, 310, 350, 310, 350, 300);
		ctxCanvas.bezierCurveTo(350, 283, 400, 283, 400, 300);
		ctxCanvas.bezierCurveTo(400, 310, 450, 310, 450, 300);
		ctxCanvas.bezierCurveTo(450, 283, 500, 283, 500, 300);
		ctxCanvas.bezierCurveTo(500, 310, 550, 310, 550, 300);
		ctxCanvas.bezierCurveTo(550, 283, 600, 283, 600, 300);
		ctxCanvas.bezierCurveTo(600, 310, 650, 310, 650, 300);
		ctxCanvas.bezierCurveTo(650, 283, 700, 283, 700, 300);
		ctxCanvas.bezierCurveTo(700, 310, 750, 310, 750, 300);
		ctxCanvas.bezierCurveTo(750, 283, 795, 283, 795, 300);
		ctxCanvas.bezierCurveTo(795, 310, 795, 310, 795, 300);

		ctxCanvas.lineTo(canvas.width - 5, 315);
		ctxCanvas.lineTo(canvas.width - 5, canvas.height - 25);
		ctxCanvas.lineTo(300, canvas.height - 20);
		ctxCanvas.fillStyle = '#262626';
		ctxCanvas.shadowColor = 'rgba(0,0,0,0.5)';
		ctxCanvas.shadowBlur = 40;
		ctxCanvas.shadowOffsetX = -10;
		ctxCanvas.shadowOffsetY = -40;
		ctxCanvas.fill();
		ctxCanvas.shadowBlur = 0;

		//add luas shape
		ctxCanvas.beginPath();
		ctxCanvas.moveTo(800, 10);
		ctxCanvas.lineTo(575, 10);
		ctxCanvas.lineTo(600, 80);
		ctxCanvas.lineTo(800, 80);
		ctxCanvas.fillStyle = 'rgba(255,255,255,0.3)';
		ctxCanvas.shadowBlur = 30;
		ctxCanvas.shadowOffsetX = 0;
		ctxCanvas.shadowOffsetY = 30;
		ctxCanvas.fill();

		//luas title
		ctxCanvas.beginPath();
		ctxCanvas.font = 'bold 30px sans-serif';
		ctxCanvas.fillStyle = 'rgba(255,255,255,0.8)';
		ctxCanvas.textAlign = 'left';
		ctxCanvas.fillText('Luas', 610, 40, 50);

		//luas amount
		ctxCanvas.beginPath();
		ctxCanvas.font = 'bold 30px sans-serif';
		ctxCanvas.textAlign = 'left';
		ctxCanvas.fillText(luas, 613, 68, 140);

		// xp
		ctxCanvas.arc(60, 460, 35, 0, Math.PI * 2);
		ctxCanvas.lineWidth = 10;
		ctxCanvas.strokeStyle = 'rgba(0,0,0,0.4)';
		ctxCanvas.stroke();

		ctxCanvas.beginPath();
		const a = xp / 500;
		const level = Math.floor(a) || 0;
		
		ctxCanvas.arc(60, 460, 35, Math.PI * 1.5, Math.PI * 1.5 + (Math.PI * 2 * (a - Math.floor(a)).toFixed(2) || 0));
		ctxCanvas.strokeStyle = '#ffffff';
		ctxCanvas.stroke();

		ctxCanvas.beginPath();
		ctxCanvas.font = 'bold 25px sans-serif';
		ctxCanvas.fillStyle = '#ffffff';
		ctxCanvas.textAlign = 'center';
		ctxCanvas.fillText(level, 60, 460, 35);

		ctxCanvas.font = 'bold 20px sans-serif';
		ctxCanvas.textAlign = 'center';
		ctxCanvas.fillText('LEVEL', 60, 480, 35);

		ctxCanvas.font = 'bold 20px sans-serif';
		ctxCanvas.textAlign = 'center';
		ctxCanvas.fillText('MOD', 60, 410, 70);

		ctxCanvas.beginPath();
		ctxCanvas.arc(150, 460, 40, 0, Math.PI * 2);
		ctxCanvas.fillStyle = '#ffffff';
		ctxCanvas.fill();

		ctxCanvas.beginPath();
		ctxCanvas.font = 'bold 25px sans-serif';
		ctxCanvas.fillStyle = 'rgba(0,0,0,0.7)';
		ctxCanvas.textAlign = 'center';
		ctxCanvas.fillText(rankPosition, 150, 460, 50);
		ctxCanvas.font = 'bold 20px sans-serif';
		ctxCanvas.textAlign = 'center';
		ctxCanvas.fillText('RANK', 150, 480, 50);

		ctxCanvas.beginPath();
		ctxCanvas.arc(240, 460, 40, 0, Math.PI * 2);
		ctxCanvas.fillStyle = '#ffffff';
		ctxCanvas.fill();

		ctxCanvas.beginPath();
		ctxCanvas.font = 'bold 25px sans-serif';
		ctxCanvas.fillStyle = 'rgba(0,0,0,0.7)';
		ctxCanvas.textAlign = 'center';
		ctxCanvas.fillText(bans, 240, 460, 50);
		ctxCanvas.font = 'bold 20px sans-serif';
		ctxCanvas.textAlign = 'center';
		ctxCanvas.fillText('BANS', 240, 480, 50);

		// add bio line
		ctxCanvas.beginPath();
		ctxCanvas.moveTo(370, 338);
		ctxCanvas.lineTo(canvas.width - 40, 338);
		ctxCanvas.arcTo(canvas.width - 20, 338, canvas.width - 20, 358, 20);
		ctxCanvas.lineTo(canvas.width - 20, 378);
		ctxCanvas.arcTo(canvas.width - 20, 438, canvas.width - 40, 438, 20);
		ctxCanvas.lineTo(330, 438);
		ctxCanvas.arcTo(310, 438, 310, 378, 20);
		ctxCanvas.lineTo(310, 358);
		ctxCanvas.arcTo(310, 338, 330, 338, 20);
		ctxCanvas.lineWidth = 1;
		ctxCanvas.strokeStyle = 'rgba(255,255,255,0.4)';
		ctxCanvas.stroke();

		// add bio title
		ctxCanvas.beginPath();
		ctxCanvas.font = 'bold 20px sans-serif';
		ctxCanvas.fillStyle = 'rgba(255,255,255,0.4)';
		ctxCanvas.fillText('BIO', 350, 345, 50);
		// add bio text
		ctxCanvas.beginPath();
		ctxCanvas.font = 'bold 23px sans-serif';
		ctxCanvas.fillStyle = 'rgba(255,255,255,0.4)';
		ctxCanvas.textAlign = 'center';
		ctxCanvas.fillText(wordWrap(bio.shorten(200), 50), 545, 368, 460);
		// Emblema
		if (!emblem) {
			ctxCanvas.beginPath();
			ctxCanvas.fillStyle = 'rgba(255,255,255,0.4)';
			ctxCanvas.font = 'bold 25px sans-serif';
			ctxCanvas.textAlign = 'center';
			ctxCanvas.fillText('NO', 680, 490, 150);
			ctxCanvas.fillText('EMBLEM', 685, 530, 150);
		} else {
			const emblemImage = await (async () => {
				return (
					this.client.imagesCanvas.get(emblem) ||
					(await (async () => {
						const img = await loadImage(emblem);
						this.client.imagesCanvas.set(emblem, img);

						return img;
					})())
				);
			})();

			ctxCanvas.shadowBlur = 10;
			ctxCanvas.shadowOffsetX = 10;
			ctxCanvas.shadowOffsetY = 10;
			ctxCanvas.beginPath();
			ctxCanvas.drawImage(emblemImage, 640, 450, 110, 110);
		}

		// Badges
		ctxCanvas.beginPath();
		ctxCanvas.moveTo(410, 450);
		ctxCanvas.lineTo(580, 450);
		ctxCanvas.arcTo(600, 450, 600, 470, 20);
		ctxCanvas.lineTo(600, 480);
		ctxCanvas.arcTo(600, 570, 580, 570, 20);
		ctxCanvas.lineTo(330, 570);
		ctxCanvas.arcTo(310, 570, 310, 550, 20);
		ctxCanvas.lineTo(310, 470);
		ctxCanvas.arcTo(310, 450, 330, 450, 20);
		ctxCanvas.stroke();

		ctxCanvas.beginPath();
		ctxCanvas.font = 'bold 18px sans-serif';
		ctxCanvas.fillStyle = 'rgba(255,255,255,0.4)';
		ctxCanvas.fillText('BADGES', 370, 456, 80);
		ctxCanvas.shadowOffsetX = 2;
		ctxCanvas.shadowOffsetY = 2;

		// Load badges images
		let badgeX = 317;
		let badgeY = 457;
		flags = flags.toArray().filter(x => !['VERIFIED_BOT', 'TEAM_USER'].includes(x));
		for (let i in flags) {
			const flagName = flags[i];
			const badge = await (async image => {
				return (
					this.client.imagesCanvas.get(image) ||
					(await (async () => {
						const img = await loadImage(image);
						this.client.imagesCanvas.set(image, img);

						return img;
					})())
				);
			})(global.emojis.get(flagName).url);
			ctxCanvas.drawImage(badge, badgeX, badgeY, 35, 35);
			badgeX += 40;
			if (badgeX >= 565) {
				badgeX = 315;
				badgeY += 37;
			}
		}

		ctxCanvas.stroke();

		return canvas;
	}
};

function wordWrap(str, maxWidth) {
	var newLineStr = '\n';
	var done = false;
	var res = '';
	while (str.length > maxWidth) {
		var found = false;
		for (var i = maxWidth - 1; i >= 0; i--) {
			if (testWhite(str.charAt(i))) {
				res = res + [str.slice(0, i), newLineStr].join('');
				str = str.slice(i + 1);
				found = true;
				break;
			}
		}
		if (!found) {
			res += [str.slice(0, maxWidth), newLineStr].join('');
			str = str.slice(maxWidth);
		}
	}

	return res + str;
}

function testWhite(x) {
	var white = new RegExp(/^\s$/);
	return white.test(x.charAt(0));
}
