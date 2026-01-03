/*
 * SPDX-License-Identifier: Apache-2.0
 * E-Voting Chaincode JavaScript
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class EVotingContract extends Contract {
    // ==================== ELECTION CRUD ====================
    async InitLedger(ctx) {
        const election = {
            id: 'election-001',
            title: 'Pemilihan Presiden 2024',
            description: 'Pemilihan Presiden dan Wakil Presiden Republik Indonesia',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            candidates: [],
            totalVoters: 0,
            totalVotes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            docType: 'election',
        };
        await ctx.stub.putState(election.id, Buffer.from(JSON.stringify(election)));
    }

    async CreateElection(ctx, id, title, description, endDate) {
        const exists = await this.ElectionExists(ctx, id);
        if (exists) {
            throw new Error(`Election ${id} already exists`);
        }
        const election = {
            id,
            title,
            description,
            startDate: new Date().toISOString(),
            endDate,
            isActive: true,
            candidates: [],
            totalVoters: 0,
            totalVotes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            docType: 'election',
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(election)));
    }

    async GetElection(ctx, id) {
        const data = await ctx.stub.getState(id);
        if (!data || data.length === 0) {
            throw new Error(`Election ${id} does not exist`);
        }
        return data.toString();
    }

    async UpdateElection(ctx, id, title, description, endDate, isActive) {
        const data = await ctx.stub.getState(id);
        if (!data || data.length === 0) {
            throw new Error(`Election ${id} does not exist`);
        }
        const election = JSON.parse(data.toString());
        election.title = title;
        election.description = description;
        election.endDate = endDate;
        election.isActive = (isActive === 'true');
        election.updatedAt = new Date().toISOString();
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(election)));
    }

    async DeleteElection(ctx, id) {
        const data = await ctx.stub.getState(id);
        if (!data || data.length === 0) {
            throw new Error(`Election ${id} does not exist`);
        }
        const election = JSON.parse(data.toString());
        if (election.totalVotes > 0) {
            throw new Error('Cannot delete election with existing votes');
        }
        await ctx.stub.deleteState(id);
    }

    async ElectionExists(ctx, id) {
        const data = await ctx.stub.getState(id);
        return (!!data && data.length > 0);
    }

    async GetAllElections(ctx) {
        const query = {
            selector: { docType: 'election' }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                results.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(results);
    }

    // ==================== CANDIDATE CRUD ====================
    async AddCandidate(ctx, electionId, candidateId, name, description, logoUrl) {
        const electionData = await ctx.stub.getState(electionId);
        if (!electionData || electionData.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }
        const election = JSON.parse(electionData.toString());
        const candidateKey = `candidate-${candidateId}`;
        const exists = await ctx.stub.getState(candidateKey);
        if (exists && exists.length > 0) {
            throw new Error(`Candidate ${candidateId} already exists`);
        }
        const candidate = {
            id: candidateId,
            name,
            description,
            voteCount: 0,
            logoUrl,
            docType: 'candidate',
        };
        await ctx.stub.putState(candidateKey, Buffer.from(JSON.stringify(candidate)));
        election.candidates.push(candidateId);
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    }

    async GetCandidate(ctx, candidateId) {
        const candidateKey = `candidate-${candidateId}`;
        const data = await ctx.stub.getState(candidateKey);
        if (!data || data.length === 0) {
            throw new Error(`Candidate ${candidateId} does not exist`);
        }
        return data.toString();
    }

    async UpdateCandidate(ctx, candidateId, name, description, logoUrl) {
        const candidateKey = `candidate-${candidateId}`;
        const data = await ctx.stub.getState(candidateKey);
        if (!data || data.length === 0) {
            throw new Error(`Candidate ${candidateId} does not exist`);
        }
        const candidate = JSON.parse(data.toString());
        candidate.name = name;
        candidate.description = description;
        candidate.logoUrl = logoUrl;
        await ctx.stub.putState(candidateKey, Buffer.from(JSON.stringify(candidate)));
    }

    async DeleteCandidate(ctx, electionId, candidateId) {
        const candidateKey = `candidate-${candidateId}`;
        const data = await ctx.stub.getState(candidateKey);
        if (!data || data.length === 0) {
            throw new Error(`Candidate ${candidateId} does not exist`);
        }
        const candidate = JSON.parse(data.toString());
        if (candidate.voteCount > 0) {
            throw new Error('Cannot delete candidate with existing votes');
        }
        await ctx.stub.deleteState(candidateKey);
        // Remove from election
        const electionData = await ctx.stub.getState(electionId);
        if (electionData && electionData.length > 0) {
            const election = JSON.parse(electionData.toString());
            election.candidates = election.candidates.filter(id => id !== candidateId);
            await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
        }
    }

    async GetCandidatesByElection(ctx, electionId) {
        const electionData = await ctx.stub.getState(electionId);
        if (!electionData || electionData.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }
        const election = JSON.parse(electionData.toString());
        const results = [];
        for (const candidateId of election.candidates) {
            const candidateKey = `candidate-${candidateId}`;
            const data = await ctx.stub.getState(candidateKey);
            if (data && data.length > 0) {
                results.push(JSON.parse(data.toString()));
            }
        }
        return JSON.stringify(results);
    }

    // ==================== VOTER CRUD ====================
    async RegisterVoter(ctx, voterId, name, email, citizenId) {
        const voterKey = `voter-${voterId}`;
        const exists = await ctx.stub.getState(voterKey);
        if (exists && exists.length > 0) {
            throw new Error(`Voter ${voterId} already registered`);
        }
        const voter = {
            id: voterId,
            name,
            email,
            voted: false,
            votedFor: '',
            votedAt: '',
            citizenId,
            docType: 'voter',
        };
        await ctx.stub.putState(voterKey, Buffer.from(JSON.stringify(voter)));
    }

    async GetVoter(ctx, voterId) {
        const voterKey = `voter-${voterId}`;
        const data = await ctx.stub.getState(voterKey);
        if (!data || data.length === 0) {
            throw new Error(`Voter ${voterId} does not exist`);
        }
        return data.toString();
    }

    async UpdateVoter(ctx, voterId, name, email) {
        const voterKey = `voter-${voterId}`;
        const data = await ctx.stub.getState(voterKey);
        if (!data || data.length === 0) {
            throw new Error(`Voter ${voterId} does not exist`);
        }
        const voter = JSON.parse(data.toString());
        if (voter.voted) {
            throw new Error('Cannot update voter who has already voted');
        }
        voter.name = name;
        voter.email = email;
        await ctx.stub.putState(voterKey, Buffer.from(JSON.stringify(voter)));
    }

    async DeleteVoter(ctx, voterId) {
        const voterKey = `voter-${voterId}`;
        const data = await ctx.stub.getState(voterKey);
        if (!data || data.length === 0) {
            throw new Error(`Voter ${voterId} does not exist`);
        }
        const voter = JSON.parse(data.toString());
        if (voter.voted) {
            throw new Error('Cannot delete voter who has already voted');
        }
        await ctx.stub.deleteState(voterKey);
    }

    async GetAllVoters(ctx) {
        const query = {
            selector: { docType: 'voter' }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                results.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(results);
    }

    // ==================== VOTING ====================
    async CastVote(ctx, voterId, electionId, candidateId) {
        const voterKey = `voter-${voterId}`;
        const voterData = await ctx.stub.getState(voterKey);
        if (!voterData || voterData.length === 0) {
            throw new Error(`Voter ${voterId} does not exist`);
        }
        const voter = JSON.parse(voterData.toString());
        if (voter.voted) {
            throw new Error(`Voter ${voterId} has already voted`);
        }
        const electionData = await ctx.stub.getState(electionId);
        if (!electionData || electionData.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }
        const election = JSON.parse(electionData.toString());
        if (!election.isActive) {
            throw new Error(`Election ${electionId} is not active`);
        }
        if (!election.candidates.includes(candidateId)) {
            throw new Error(`Candidate ${candidateId} is not in election ${electionId}`);
        }
        const candidateKey = `candidate-${candidateId}`;
        const candidateData = await ctx.stub.getState(candidateKey);
        if (!candidateData || candidateData.length === 0) {
            throw new Error(`Candidate ${candidateId} does not exist`);
        }
        const candidate = JSON.parse(candidateData.toString());
        // Update voter
        voter.voted = true;
        voter.votedFor = candidateId;
        voter.votedAt = new Date().toISOString();
        await ctx.stub.putState(voterKey, Buffer.from(JSON.stringify(voter)));
        // Update candidate
        candidate.voteCount++;
        await ctx.stub.putState(candidateKey, Buffer.from(JSON.stringify(candidate)));
        // Update election
        election.totalVotes++;
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
    }

    async GetVotingResults(ctx, electionId) {
        const electionData = await ctx.stub.getState(electionId);
        if (!electionData || electionData.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }
        const election = JSON.parse(electionData.toString());
        const candidates = [];
        for (const candidateId of election.candidates) {
            const candidateKey = `candidate-${candidateId}`;
            const data = await ctx.stub.getState(candidateKey);
            if (data && data.length > 0) {
                candidates.push(JSON.parse(data.toString()));
            }
        }
        return JSON.stringify({
            electionId,
            title: election.title,
            totalVotes: election.totalVotes,
            totalVoters: election.totalVoters,
            results: candidates,
        });
    }
}

module.exports = EVotingContract;
