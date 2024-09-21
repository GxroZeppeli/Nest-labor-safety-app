import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { IssuesService } from './issues.service';
import CreateIssueDto from './dto/create-issue.dto';
import UpdateIssueDto from './dto/update-issue.dto';
import { GetTableDto } from './dto/get-table.dto';

@UseGuards(AuthGuard)
@Controller('api/issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get()
  getIssues(@Query('page') page: string, @Req() req) {
    if (!page || !+page || +page < 1) page = '1';
    return this.issuesService.getIssues(+page, req.user);
  }

  @Get('table')
  getTable(@Query() getTableDto: GetTableDto) {
    return this.issuesService.getTable(getTableDto);
  }

  @Get(':id')
  getIssue(@Param('id') id: number, @Req() req) {
    return this.issuesService.getIssue(id, req.user);
  }

  @Post()
  createIssue(@Body(new ValidationPipe()) body: CreateIssueDto) {
    return this.issuesService.createIssue(body);
  }

  @Put(':id')
  updateIssue(
    @Param('id') id: number,
    @Body(new ValidationPipe()) body: UpdateIssueDto,
    @Req() req,
  ) {
    return this.issuesService.updateIssue(id, body, req.user);
  }

  @Delete(':id')
  deleteIssue(@Param('id') id: number, @Req() req) {
    return this.issuesService.deleteIssue(id, req.user);
  }
}
