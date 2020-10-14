from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import connections
# Create your views here.


@csrf_exempt
def bugs(request):
    '''查询bug信息列表
    '''
    if request.method == 'GET':
        sql = '''
            -- 所有不满足SLA的Bug详情
            select concat('prod-bug-', t.issue_num)                                                       as '编号',
                t.summary                                                                              as '标题',
                (select fp.name from fd_priority fp where fp.id = t.priority_id)                       as '优先级',
                (select fs.name from fd_status fs where fs.id = t.status_id)                           as '状态',
                (select fo.value
                    from fd_field_value fv,
                        fd_field_option fo
                    where fv.option_id = fo.id
                    and fv.field_id = fo.field_id
                    and fv.instance_id = t.issue_id
                    and fv.field_id = 102)                                                              as '问题类型',
                (select fv.text_value
                    from fd_field_value fv
                    where fv.instance_id = t.issue_id
                    and fv.field_id = 68)                                                               as '问题原因',
                (select fv.text_value
                    from fd_field_value fv
                    where fv.instance_id = t.issue_id
                    and fv.field_id = 69)                                                               as '解决方案',
                t.creation_date                                                                        as '创建时间',
                (select dl.creation_date
                    from agile_data_log dl
                    where dl.issue_id = t.issue_id
                    and dl.field = 'status'
                    and dl.old_string = '待处理'
                    and dl.new_string = '处理中'
                    order by dl.creation_date asc
                    limit 1)                                                                              as '开始处理时间',
                (select dl.creation_date
                    from agile_data_log dl
                    where dl.issue_id = t.issue_id
                    and dl.field = 'status'
                    and dl.old_string = '处理中'
                    and dl.new_string = '测试中'
                    order by dl.creation_date asc
                    limit 1)                                                                              as '处理完成时间',
                (select dl.creation_date
                    from agile_data_log dl
                    where dl.issue_id = t.issue_id
                    and dl.field = 'status'
                    and dl.old_string = '测试中'
                    and dl.new_string = '待发布'
                    order by dl.creation_date asc
                    limit 1)                                                                              as '测试完成时间',
                (select iu.REAL_NAME from iam_service.iam_user iu where iu.ID = t.assignee_id)         as '当前经办人',
                IFNULL((SELECT GROUP_CONCAT(ad.old_string, '->', ad.new_string)
                        FROM agile_data_log ad
                        WHERE ad.issue_id = t.issue_id
                            AND ad.field = 'assignee'
                        GROUP BY ad.issue_id),
                        (select iu.REAL_NAME from iam_service.iam_user iu where iu.id = t.assignee_id)) AS `经办人流转`
                    ,
                (get_assignee_duration(t.issue_id))                                                    AS '各经办人停留时间'

            from (select *
                from agile_issue ai6
                where ai6.project_id = 58
                    and ai6.priority_id = 4
                    and ai6.status_id in (1, 2, 16)
                    and ai6.creation_date < date_add(curdate(), interval -12 hour)

                union all

                select *
                from agile_issue ai6
                where ai6.project_id = 58
                    and ai6.priority_id = 1
                    and ai6.status_id in (1, 2, 16)
                    and ai6.creation_date < date_add(curdate(), interval -24 hour)

                union all

                select *
                from agile_issue ai6
                where ai6.project_id = 58
                    and ai6.priority_id = 2
                    and ai6.status_id in (1, 2, 16)
                    and ai6.creation_date < date_add(curdate(), interval -48 hour)

                union all

                select *
                from agile_issue ai6
                where ai6.project_id = 58
                    and ai6.priority_id = 3
                    and ai6.status_id in (1, 2, 16)
                    and ai6.creation_date < date_add(curdate(), interval -7 day)
                ) t
            where t.type_code = 'bug'
            order by t.creation_date desc;
        '''
        body = []
        with connections['srm'].cursor() as cursor:
            cursor.execute(sql)
            rows = cursor.fetchall()
            for row in rows:
                num, title, level, status, manager, managers, managers_delay = row[0].replace('prod-bug-', ''), row[1], row[2], row[3], row[11], row[12], row[13]
                # print(num, title, level, status, manager, managers, managers_delay)
                body.append(
                    {
                        'num': num,
                        'title': title,
                        'level': level,
                        'status': status,
                        'manager': manager,
                        'managers': managers,
                        'managers_delay': managers_delay,
                    }
                )
        res = {
            'code': 0,
            'message': '操作成功',
            'data': body
        }
        return JsonResponse(res)
    else:
        res = dict()
        return JsonResponse(res)
