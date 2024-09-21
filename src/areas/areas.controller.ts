import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { AreasService } from './areas.service';
import CreateAreaDto from './dto/create-area.dto';
import UpdateAreaDto from './dto/update-area.dto';

@UseGuards(AuthGuard)
@Controller('api/areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  getAreas() {
    return this.areasService.getAreas();
  }

  @Get(':id')
  getArea(@Param('id') id: number) {
    return this.areasService.getArea(id);
  }

  @Post()
  createArea(@Body(new ValidationPipe()) body: CreateAreaDto, @Req() req) {
    return this.areasService.createArea(body, req.user);
  }

  @Put(':id')
  updateArea(@Param('id') id: number, @Body() body: UpdateAreaDto, @Req() req) {
    return this.areasService.updateArea(id, body, req.user);
  }

  @Delete(':id')
  deleteArea(@Param('id') id: number, @Req() req) {
    return this.areasService.deleteArea(id, req.user);
  }
}
