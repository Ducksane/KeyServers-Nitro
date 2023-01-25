import { IssueMessageData } from '@nitrots/nitro-renderer';
import { FC } from 'react';
import { Base, Column, Grid } from '../../../../common';

interface ModToolsPickedIssuesTabViewProps
{
    pickedIssues: IssueMessageData[];
}

export const ModToolsPickedIssuesTabView: FC<ModToolsPickedIssuesTabViewProps> = props =>
{
    const { pickedIssues = null } = props;
    
    return (
        <Column gap={ 0 } overflow="hidden">
            <Column gap={ 2 }>
                <Grid gap={ 1 } className="text-black fw-bold border-bottom pb-1">
                    <Base style={{color: "var(--test-galaxytext)"}} className="g-col-2">Type</Base>
                    <Base style={{color: "var(--test-galaxytext)"}} className="g-col-3">Room/Player</Base>
                    <Base style={{color: "var(--test-galaxytext)"}} className="g-col-4">Opened</Base>
                    <Base style={{color: "var(--test-galaxytext)"}} className="g-col-3">Picker</Base>
                </Grid>
            </Column>
            <Column overflow="auto" className="striped-children" gap={ 0 }>
                { pickedIssues && (pickedIssues.length > 0) && pickedIssues.map(issue =>
                {
                    return (
                        <Grid key={ issue.issueId } gap={ 1 } alignItems="center" className="text-black py-1 border-bottom">
                            <Base style={{color: "var(--test-galaxytext)"}} className="g-col-2">{ issue.categoryId }</Base>
                            <Base style={{color: "var(--test-galaxytext)"}} className="g-col-3">{ issue.reportedUserName }</Base>
                            <Base style={{color: "var(--test-galaxytext)"}} className="g-col-4">{ new Date(Date.now() - issue.issueAgeInMilliseconds).toLocaleTimeString() }</Base>
                            <Base style={{color: "var(--test-galaxytext)"}} className="g-col-3">{ issue.pickerUserName }</Base>
                        </Grid>
                    );
                }) }
            </Column>
        </Column>
    );
}
