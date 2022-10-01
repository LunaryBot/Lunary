import { createCanvas } from 'canvas';

import Template, { TemplateType } from '@structures/Template';

import { ProfileInfos, ProfileTemplateBuilded, CanvasInfo } from '../../@types';

const profileImages = require('../../../assets/jsons/profile.json');

const textColor = 'rgba(255,255,255,0.6)';

class DefaultProfileTemplate extends Template {
	constructor(client: LunaryClient) {
		super(client, {
			name: 'default',
			dirname: __dirname,
			type: TemplateType.PROFILE,
		});
	}

	public async build(
		{ avatar: avatar, background: _background, bio, emblem, flags, pattern: _pattern, luas, rankPosition = 'N/A', username, xp, color = '#A020F0', marry }: ProfileInfos, 
		{ canvas, context }: CanvasInfo = this.createCanvasInfo()
	): Promise<ProfileTemplateBuilded> {
		const background = await this.client.getCanvasImage(_background, profileImages.backgrounds[_background]);
		const pattern = _pattern ? await this.client.getCanvasImage(_pattern, profileImages.patterns[_pattern]) : null;

		//add background
		context.drawImage(background, 300, 65, 475, 250);

		// add emblem
		if(emblem) {
			context.shadowBlur = 10;
			context.shadowOffsetX = 10;
			context.shadowOffsetY = 10;
			context.beginPath();
			context.drawImage(await this.client.getCanvasImage(emblem), 665, 205, 110, 110);
		}

		// left card
		context.fillStyle = '#262626';
		context.beginPath();
		context.moveTo(0, 65);
		context.lineTo(0, 535);
		context.arcTo(0, 585, 50, 585, 50);
		context.lineTo(250, 585);
		context.lineTo(300, 585);
		context.arcTo(300, 15, 250, 15, 50);
		context.lineTo(50, 15);
		context.arcTo(0, 15, 0, 65, 50);
		context.stroke();
		context.shadowBlur = 10;
		context.shadowOffsetX = 10;
		context.fill();
		
		if(pattern) {
			context.save();
			context.clip();
			context.drawImage(pattern, 0, 0, 300, 600);
			context.restore();
		}

		//add wave shape
		context.beginPath();
		context.moveTo(0, 255);
		context.bezierCurveTo(0, 265, 50, 265, 50, 255);
		context.bezierCurveTo(50, 245, 100, 245, 100, 255);
		context.bezierCurveTo(100, 265, 150, 265, 150, 255);
		context.bezierCurveTo(150, 245, 200, 245, 200, 255);
		context.bezierCurveTo(200, 265, 250, 265, 250, 255);
		context.bezierCurveTo(250, 245, 300, 245, 300, 255);
		context.lineTo(300, 585);
		context.lineTo(50, 585);
		context.arcTo(0, 585, 0, 535, 50);
		context.fillStyle = color;
		context.fill();
		context.shadowBlur = 0;

		//add username
		context.beginPath();
		context.font = 'bold 30px sans-serif';
		context.fillStyle = '#ffffff';
		context.textAlign = 'center';
		context.fillText(username, 150, 350, 280);

		//add avatar
		context.beginPath();
		context.arc(150, 225, 75, 0, Math.PI * 2);
		context.lineWidth = 6;
		context.strokeStyle = textColor;
		context.stroke();
		context.closePath();
		context.save();
		context.clip();
		context.drawImage(await this.client.getCanvasImage(avatar), 75, 150, 150, 150);
		context.restore();

		//add center card and wave shape
		context.beginPath();
		context.moveTo(300, 300);

		context.bezierCurveTo(300, 310, 350, 310, 350, 300);
		context.bezierCurveTo(350, 283, 400, 283, 400, 300);
		context.bezierCurveTo(400, 310, 450, 310, 450, 300);
		context.bezierCurveTo(450, 283, 500, 283, 500, 300);
		context.bezierCurveTo(500, 310, 550, 310, 550, 300);
		context.bezierCurveTo(550, 283, 600, 283, 600, 300);
		context.bezierCurveTo(600, 310, 650, 310, 650, 300);
		context.bezierCurveTo(650, 283, 700, 283, 700, 300);
		context.bezierCurveTo(700, 310, 750, 310, 750, 300);
		context.bezierCurveTo(750, 283, 795, 283, 795, 300);
		context.bezierCurveTo(795, 310, 795, 310, 795, 300);

		context.lineTo(canvas.width - 5, 315);
		context.lineTo(canvas.width - 5, canvas.height - 25);
		context.lineTo(300, canvas.height - 20);
		context.fillStyle = '#262626';
		context.shadowColor = 'rgba(0,0,0,0.5)';
		context.shadowBlur = 40;
		context.shadowOffsetX = -10;
		context.shadowOffsetY = -40;
		context.fill();
		context.shadowBlur = 0;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;

		context.beginPath();
		context.moveTo(300, canvas.height - 70);
		context.lineTo(canvas.width - 5, canvas.height - 70);
		context.lineTo(canvas.width - 5, canvas.height - 25);
		context.lineTo(300, canvas.height - 20);
		context.fillStyle = '#161616';
		context.fill();

		for(const i in flags) {
			const flagImageURL = profileImages.badges[flags[i]];

			context.drawImage(await this.client.getCanvasImage(flags[i], flagImageURL), 310 + 40 * Number(i), canvas.height - 65, 35, 35);
		}

		//add luas shape
		context.beginPath();
		context.moveTo(800, 10);
		context.lineTo(575, 10);
		context.lineTo(600, 80);
		context.lineTo(800, 80);
		context.fillStyle = 'rgba(255,255,255,0.3)';
		context.shadowBlur = 30;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 30;
		context.fill();

		//luas image
		context.drawImage(await this.client.getCanvasImage('https://cdn.discordapp.com/emojis/832083303627620422.png?v=1'), 730, 20, 50, 50);
		
		//luas amount
		context.beginPath();
		context.font = 'bold 30px sans-serif';
		context.fillStyle = 'rgba(255,255,255,0.8)';
		context.textAlign = 'right';
		context.fillText(luas.formatUnits(['M', 'bi', 'tri']).replace(/,/g, '.'), 730, 55, 120);

		// xp
		context.arc(105, 460, 35, 0, Math.PI * 2);
		context.lineWidth = 10;
		context.strokeStyle = 'rgba(0,0,0,0.4)';
		context.stroke();

		context.beginPath();
		const a = xp / 500;
		const level = Math.floor(a) || 0;
		
		context.arc(105, 460, 35, Math.PI * 1.5, Math.PI * 1.5 + (Math.PI * 2 * (a - Math.floor(a)) || 0));
		context.strokeStyle = '#ffffff';
		context.stroke();

		context.beginPath();
		context.font = 'bold 25px sans-serif';
		context.fillStyle = '#ffffff';
		context.textAlign = 'center';
		context.fillText(level.toString(), 105, 460, 35);

		context.font = 'bold 20px sans-serif';
		context.textAlign = 'center';
		context.fillText('LEVEL', 105, 480, 35);

		context.font = 'bold 20px sans-serif';
		context.textAlign = 'center';
		context.fillText('MOD', 105, 410, 70);

		context.beginPath();
		context.arc(195, 460, 40, 0, Math.PI * 2);
		context.fillStyle = '#ffffff';
		context.fill();

		context.beginPath();
		context.font = 'bold 25px sans-serif';
		context.fillStyle = 'rgba(0,0,0,0.7)';
		context.textAlign = 'center';
		context.fillText(rankPosition, 195, 460, 50);

		context.font = 'bold 20px sans-serif';
		context.textAlign = 'center';
		context.fillText('RANK', 195, 480, 50);

		// add bio line
		context.beginPath();
		context.moveTo(370, 338);
		context.lineTo(canvas.width - 40, 338);
		context.arcTo(canvas.width - 20, 338, canvas.width - 20, 358, 20);
		context.lineTo(canvas.width - 20, 378);
		context.arcTo(canvas.width - 20, 438, canvas.width - 40, 438, 20);
		context.lineTo(330, 438);
		context.arcTo(310, 438, 310, 378, 20);
		context.lineTo(310, 358);
		context.arcTo(310, 338, 330, 338, 20);
		context.lineWidth = 1;
		context.strokeStyle = 'rgba(255,255,255,0.4)';
		context.stroke();

		// add bio title
		context.beginPath();
		context.font = 'bold 20px sans-serif';
		context.fillStyle = 'rgba(255,255,255,0.4)';
		context.fillText('BIO', 350, 345, 50);
		
		// add bio text
		context.beginPath();
		context.font = '23px sans-serif';
		context.fillStyle = 'rgba(255,255,255,0.4)';
		context.textAlign = 'center';
		context.fillText(bio.shorten(200).wordWrap(50), 545, 368, 460);

		return {
			canvas,
			context,
			buffer() {
				return canvas.toBuffer('image/png');
			},
		};
	}

	public createCanvasInfo(): CanvasInfo {
		const canvas = createCanvas(800, 600);
		const context = canvas.getContext('2d');

		return { canvas, context };
	}
}

export default DefaultProfileTemplate;